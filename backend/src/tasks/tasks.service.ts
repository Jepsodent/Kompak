import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignMemberTaskDto } from './dto/assign-member.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskStatusService } from './task-status.service';
import { SubmitProofDto } from './dto/submit-proof.dto';
import { ReviewTaskDto } from './dto/review-task.dto';

@Injectable()
export class TasksService implements OnModuleInit {
  private defaultTodoStatusId!: string;

  constructor(
    private readonly supabase: SupabaseRequestService,
    private readonly taskStatus: TaskStatusService,
  ) {}

  async onModuleInit() {
    let { data } = await this.supabase.client
      .from('task_statuses')
      .select('id')
      .eq('code', 'TODO')
      .maybeSingle();
    if (!data) {
      const { data: newStatus, error } = await this.supabase.client
        .from('task_statuses')
        .insert({
          code: 'TODO',
          name: 'To Do',
          sort_order: 1,
        })
        .select('id')
        .single();
      if (error || !newStatus)
        throw new Error('Failed to auto create TODO status in DB!');
      data = newStatus;
    }
    this.defaultTodoStatusId = data.id;
  }

  async createTask(projectId: string, dto: CreateTaskDto, userId: string) {
    const { assignee_ids, status_id, ...taskFields } = dto;

    // CHECK 1: Is the creator a project member?
    const { data: creatorMember, error: creatorError } =
      await this.supabase.client
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('profile_id', userId)
        .eq('membership_status', 'ACTIVE')
        .single();
    if (creatorError || !creatorMember) {
      throw new ForbiddenException(
        'You are not an active member of this project',
      );
    }

    // CHECK 2: Does the status_id exist?
    const targetStatusId = status_id;
    const { data: statusExists, error: statusError } =
      await this.supabase.client
        .from('task_statuses')
        .select('id')
        .eq('id', targetStatusId)
        .single();
    if (statusError || !statusExists) {
      throw new BadRequestException('Invalid task status ID');
    }

    // CHECK 3: Are all assinee_ids valid project_members?
    let validAssigneeMemberIds: string[] = [];

    if (assignee_ids && assignee_ids.length > 0) {
      const uniqueAssigneeIds = [...new Set(assignee_ids)];

      const { data: validMembers, error: assigneeError } =
        await this.supabase.client
          .from('project_members')
          .select('id')
          .eq('project_id', projectId)
          .in('id', uniqueAssigneeIds)
          .eq('membership_status', 'ACTIVE');
      if (assigneeError || !validMembers) {
        throw new BadRequestException('Failed to validate project assignees');
      }

      validAssigneeMemberIds = validMembers.map((m) => m.id);
    }

    // INSERTION
    const { data: createdTask, error: taskError } = await this.supabase.client
      .from('tasks')
      .insert({
        ...taskFields,
        project_id: projectId,
        status_id: targetStatusId,
        created_by_member_id: creatorMember.id,
      })
      .select()
      .single();
    if (taskError || !createdTask) {
      throw new BadRequestException(
        'Failed to create task: ' + taskError.message,
      );
    }

    if (validAssigneeMemberIds.length > 0) {
      const assigneeRows = validAssigneeMemberIds.map((memberId) => ({
        task_id: createdTask.id,
        project_member_id: memberId,
      }));

      const { error: assigneesInsertError } = await this.supabase.client
        .from('task_assignees')
        .insert(assigneeRows);

      if (assigneesInsertError) {
        await this.supabase.client
          .from('tasks')
          .delete()
          .eq('id', createdTask.id);

        throw new BadRequestException(
          'Failed to assign members to task: ' + assigneesInsertError.message,
        );
      }
    }

    return {
      ...createdTask,
      assignees: validAssigneeMemberIds,
    };
  }

  async getAllTasks(projectId: string) {
    const { data, error } = await this.supabase.client
      .from('tasks')
      .select(
        `
            id,
            title,
            due_date,
            status: task_statuses(id,code,name),
            assignees: task_assignees(
                    member: project_members(
                        profile: profiles(
                            name,
                            profile_image_url
                        )
                    )
                )
            `,
      )
      .eq('project_id', projectId);
    if (error)
      throw new BadRequestException('Failed to fetch tasks: ' + error.message);
    return data;
  }

  async getTaskById(projectId: string, taskId: string) {
    const { data, error } = await this.supabase.client
      .from('tasks')
      .select(
        `
      id,
      title,
      description,
      due_date,
      source,
      created_at,
      updated_at,
      status:task_statuses(id, code, name),
      created_by:project_members!created_by_member_id(
        id,
        profile:profiles(name, profile_image_url)
      ),
      assignees:task_assignees(
        member:project_members(
          id,
          profile:profiles(name, profile_image_url)
        )
      ),
      proof_work:proof_of_works(
        id,
        summary_notes,
        submitted_at,
        submitted_by:project_members!submitted_by_member_id(
          id,
          profile:profiles(name, profile_image_url)
        ),
        attachments:proof_attachments(
          id,
          file_name,
          file_url,
          mime_type
        ),
        review:task_reviews(
          id,
          feedback,
          rating,
          reviewer:project_members!reviewer_member_id(
            id,
            profile:profiles(name, profile_image_url)
          )
        )
      )
    `,
      )
      .eq('project_id', projectId)
      .eq('id', taskId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Task not found');
    }

    // Safely grab the first proof_work item if it comes back as an array
    const rawProof = Array.isArray(data.proof_work)
      ? data.proof_work[0]
      : data.proof_work;

    // Format inline so TypeScript infers the combined type automatically
    const formattedProof = rawProof
      ? {
          ...rawProof,
          review: Array.isArray(rawProof.review)
            ? (rawProof.review[0] ?? null)
            : (rawProof.review ?? null),
        }
      : null;

    return {
      ...data,
      proof_work: formattedProof,
    };
  }

  async updateTask(
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
    userId: string,
  ) {
    // CHECK 1: Is the client a project member?
    const { assignee_ids, status_id, ...scalarFields } = dto;
    const { data: member, error: memberError } = await this.supabase.client
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('profile_id', userId)
      .eq('membership_status', 'ACTIVE')
      .single();
    if (memberError || !member) {
      throw new ForbiddenException(
        'You are not an active member of this project',
      );
    }

    // CHECK 2: Does the task exist in this project?
    const { data: existingTask, error: taskError } = await this.supabase.client
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single();
    if (taskError || !existingTask) {
      throw new NotFoundException('Task not found in this project');
    }

    // Prepare object for fields to update in 'tasks' table
    const updatePayload: Record<string, any> = { ...scalarFields };

    // CHECK 3: Does the status_id exist?
    if (status_id !== undefined) {
      const { data: statusExists, error: statusError } =
        await this.supabase.client
          .from('task_statuses')
          .select('id')
          .eq('id', status_id)
          .single();
      if (statusError || !statusExists) {
        throw new BadRequestException('Invalid task status ID');
      }

      updatePayload.status_id = status_id;
    }

    // CHECK 4: assignee_ids
    let validAssigneeMemberIds: string[] | null = null;

    if (assignee_ids !== undefined) {
      if (assignee_ids.length > 0) {
        const uniqueAssigneeIds = [...new Set(assignee_ids)];

        const { data: validMembers, error: assigneeError } =
          await this.supabase.client
            .from('project_members')
            .select('id')
            .eq('project_id', projectId)
            .in('id', uniqueAssigneeIds)
            .eq('membership_status', 'ACTIVE');

        if (
          assigneeError ||
          !validMembers ||
          validMembers.length !== uniqueAssigneeIds.length
        ) {
          throw new BadRequestException(
            'One or more assigned users are not active members of this project',
          );
        }

        validAssigneeMemberIds = validMembers.map((m) => m.id);
      } else {
        validAssigneeMemberIds = [];
      }
    }

    // PERFORM UPDATES
    // Step A: Update tasks table (only if scalar fields/status were changed)
    let updatedTask = existingTask;

    if (Object.keys(updatePayload).length > 0) {
      updatePayload.updated_at = new Date().toISOString();

      const { data: updated, error: updateError } = await this.supabase.client
        .from('tasks')
        .update(updatePayload as any)
        .eq('id', taskId)
        .select()
        .single();

      if (updateError || !updated) {
        throw new BadRequestException(
          'Failed to update task: ' + updateError.message,
        );
      }

      updatedTask = updated;
    }

    // Step B: Sync task_assignees table (only if assignee_ids was provided in payload)
    if (validAssigneeMemberIds !== null) {
      // Delete old assignees for this task
      const { error: deleteError } = await this.supabase.client
        .from('task_assignees')
        .delete()
        .eq('task_id', taskId);

      if (deleteError) {
        throw new BadRequestException('Failed to clear old task assignees');
      }

      // Insert new assignees (if array isn't empty)
      if (validAssigneeMemberIds.length > 0) {
        const newRows = validAssigneeMemberIds.map((memberId) => ({
          task_id: taskId,
          project_member_id: memberId,
        }));

        const { error: insertError } = await this.supabase.client
          .from('task_assignees')
          .insert(newRows);

        if (insertError) {
          throw new BadRequestException('Failed to assign new task members');
        }
      }
    }

    return {
      ...updatedTask,
      assignees: validAssigneeMemberIds ?? 'Unchanged',
    };
  }

  async deleteTask(projectId: string, taskId: string) {
    const { data, error } = await this.supabase.client
      .from('tasks')
      .delete()
      .eq('project_id', projectId)
      .eq('id', taskId)
      .select()
      .maybeSingle();
    if (error) {
      throw new BadRequestException('Delete failed: ' + error.message);
    }
    if (!data) throw new NotFoundException('Task not found in this project');
    return { message: 'Task has been successfully deleted' };
  }

  //helper for assignMember / unassignMember flow

  private async checkValidMember(memberId: string, projectId: string) {
    const { data: member, error: memberError } = await this.supabase.client
      .from('project_members')
      .select('id')
      .eq('id', memberId)
      .eq('project_id', projectId)
      .eq('membership_status', 'ACTIVE')
      .single();
    if (!member || memberError) {
      throw new NotFoundException('Target member not found in this project');
    }
    return member;
  }

  async assignMemberTask(
    projectId: string,
    taskId: string,
    dto: AssignMemberTaskDto,
  ) {
    const member = await this.checkValidMember(dto.memberId, projectId);
    const { data, error } = await this.supabase.client
      .from('task_assignees')
      .insert({
        project_member_id: member.id,
        task_id: taskId,
      })
      .select()
      .single();
    if (error?.code === '23505') {
      throw new ConflictException('Member is already assigned to this task');
    }

    if (!data || error) {
      throw new BadRequestException(
        'Failed to assign member: ' + error.message,
      );
    }
    return data;
  }

  async unassignMemberTask(
    projectId: string,
    taskId: string,
    memberId: string,
  ) {
    const member = await this.checkValidMember(memberId, projectId);
    const { data, error } = await this.supabase.client
      .from('task_assignees')
      .delete()
      .eq('project_member_id', member.id)
      .eq('task_id', taskId)
      .select()
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        'Failed to unassign member: ' + error.message,
      );
    }
    if (!data) {
      throw new NotFoundException('Member is not assigned to this task.');
    }
    return { message: 'Member successfully unassigned from the task.' };
  }

  // task update status workflow
  async updateTaskStatus(
    taskId: string,
    userId: string,
    projectId: string,
    dto: UpdateTaskStatusDto,
  ) {
    const member = await this.checkValidMember(userId, projectId);
    const targetStatusCode = this.taskStatus.getStatusId(dto.status); // string id
    const { data: task, error: taskError } = await this.supabase.client
      .from('tasks')
      .select(
        `
                task_statuses(code)
            `,
      )
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single();
    if (taskError || !task) throw new NotFoundException('Task not found!');

    if (task.task_statuses.code === 'IN_REVIEW') {
      throw new BadRequestException(
        'Task in Review cannot be dragged. Please use the review button inside task details',
      );
    }

    if (dto.status === 'DONE') {
      throw new BadRequestException(
        'Cannot move task to Done Manually, Leader must approve it via Review',
      );
    }
    if (dto.status === 'IN_REVIEW') {
      const { data: proofData } = await this.supabase.client
        .from('proof_of_works')
        .select('id')
        .eq('task_id', taskId)
        .maybeSingle();
      if (!proofData)
        throw new BadRequestException(
          'Please submit proof of work first before moving to In Review',
        );
    }

    const { data, error } = await this.supabase.client
      .from('tasks')
      .update({
        status_id: targetStatusCode,
      })
      .eq('id', taskId)
      .eq('project_id', projectId)
      .select('id')
      .single();
    if (!data || error)
      throw new BadRequestException(
        'Failed to update status task: ' + error.message,
      );
    return { message: 'Successfully updated task status to ' + dto.status };
  }

  async submitProof(
    taskId: string,
    projectId: string,
    userId: string,
    dto: SubmitProofDto,
  ) {
    const { data: status, error: statusError } = await this.supabase.client
      .from('tasks')
      .select(
        `
            task_statuses(code)`,
      )
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single();
    if (!status || statusError) throw new NotFoundException('Task not found');

    if (status.task_statuses.code !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Proof of work can only be submitted when task is In Progress',
      );
    }
    const { data: existingProofs, error: checkError } =
      await this.supabase.client
        .from('proof_of_works')
        .select('id, task_reviews(id)')
        .eq('task_id', taskId);

    if (checkError)
      throw new BadRequestException(
        'Failed to check existing proofs: ' + checkError.message,
      );

    const hasPendingProof = existingProofs?.some(
      (p) =>
        !p.task_reviews ||
        (Array.isArray(p.task_reviews) && p.task_reviews.length === 0),
    );
    if (hasPendingProof)
      throw new BadRequestException(
        'You have already submitted a proof of work. Please wait for the leader to review or reject it first!',
      );

    const member = await this.checkValidMember(userId, projectId);
    const { data: proof, error: proofError } = await this.supabase.client
      .from('proof_of_works')
      .insert({
        task_id: taskId,
        summary_notes: dto.summary_notes,
        submitted_by_member_id: member.id,
      })
      .select('id')
      .single();
    if (!proof || proofError)
      throw new BadRequestException(
        'Failed to insert proof: ' + proofError.message,
      );
    if (dto.attachments && dto.attachments.length > 0) {
      const attachmentPayloads = dto.attachments.map((file) => ({
        proof_of_work_id: proof.id,
        file_name: file.file_name,
        file_url: file.file_url,
        mime_type: file.mime_type,
      }));
      const { error: attachError } = await this.supabase.client
        .from('proof_attachments')
        .insert(attachmentPayloads);
      if (attachError) {
        throw new BadRequestException(
          'Failed to save attachments: ' + attachError.message,
        );
      }
    }
    return { message: 'Proof of work submitted successfully' };
  }

  async reviewTask(
    taskId: string,
    projectId: string,
    userId: string,
    dto: ReviewTaskDto,
  ) {
    const { data: status, error: statusError } = await this.supabase.client
      .from('tasks')
      .select(
        `
            task_statuses(code)`,
      )
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single();
    if (!status || statusError) throw new NotFoundException('Task not found');

    if (status.task_statuses.code !== 'IN_REVIEW') {
      throw new BadRequestException('Task must be In Review to be reviewed');
    }

    const member = await this.checkValidMember(userId, projectId);
    const { data: latestProof, error: proofError } = await this.supabase.client
      .from('proof_of_works')
      .select('id')
      .eq('task_id', taskId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();
    if (!latestProof || proofError)
      throw new NotFoundException('Proof of work not found');

    const { data, error } = await this.supabase.client
      .from('task_reviews')
      .insert({
        proof_of_work_id: latestProof.id,
        rating: dto.rating,
        feedback: dto.feedback,
        reviewer_member_id: member.id,
      })
      .select()
      .single();
    if (!data || error)
      throw new BadRequestException('Failed to save reviews: ', error.message);

    const targetStatusCode = dto.action === 'APPROVE' ? 'DONE' : 'IN_PROGRESS';
    const targetStatusId = this.taskStatus.getStatusId(targetStatusCode);

    const { error: updateTaskError } = await this.supabase.client
      .from('tasks')
      .update({
        status_id: targetStatusId,
      })
      .eq('id', taskId)
      .eq('project_id', projectId);
    if (updateTaskError)
      throw new BadRequestException(
        'Failed to update task status after review: ' + updateTaskError.message,
      );

    return {
      message:
        'Task has been successfully ' +
        (dto.action === 'APPROVE'
          ? 'approved and moved to Done'
          : 'rejected and moved to In Progress'),
    };
  }
}
