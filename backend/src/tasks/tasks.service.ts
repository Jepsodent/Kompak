import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseRequestService } from 'src/supabase/supabase-request.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatusService } from './task-status.service';
import { SubmitProofDto } from './dto/submit-proof.dto';
import { ReviewTaskDto } from './dto/review-task.dto';
import { TASK_STATUS_CODES } from 'src/common/enums/task-status.enum';
import { AiService } from 'src/ai/ai.service';
import { BulkCreateTaskDto } from './dto/bulk-create-task.dto';
/* 
Not best practice approaches bcs: 
1. Concurrency Risk: Jika user A mengubah judul task , dan di detik yang sama User B tugasin orang baru pada task yang sama , salah satu request akan menimpa data request lainnya karena keduanya mengirim array assignee_ids penuh. 
2. Kode service jadi bloated. Logika bisnis kanban (contoh: Ga boleh DONE Secara manual) terpaksa di taro di dalam fungsi edit umum. Ini makes the code tercampur sama logika bisnis yang rumit. 

--- gimana caranya ideal best practice ? 
aplikasi besar skala production mengatasi masalah ini dengan mendesain UI & API Secara autosave/ inline editting *not with save changes button
Cara kerja mereka simple: 
- Ketika edit judul /description / mereka cuma nembak PATCH /tasks/:id
- Begitu pilih dropdown assignee / anggota langsung ter assign saat itu juga. Request yang dikirim hanya POST/tasks/:id/assignees 
Dengan begini apakah FE akan jadi lebih ribet? 
Justru frontend lebih gampang dikelola karena setiap komponen input berdiri sendiri2 secara terisolasi , tidak ada state form raksasa yang harus dikumpulkan dan dikirm bersamaan. (walau service code nya akan jadi lebih banyak karena nembak api endpoint yg lebih banyak)

Granular Patch di Backend mengurangi resiko
- karena backend kita memisahkan logika update teks dengan pivot table assignee , database postgreSQL akan lebih menggabungkan perubahan tersebut dengan aman: 
    - Request User A (hanya membawa { title }): PostgreSQL meng-update baris tabel tasks.
    - Request User B (hanya membawa { assignee_ids }): PostgreSQL meng-update tabel pivot task_assignees.
Hasilnya: Kedua perubahan bergabung sempurna tanpa saling menimpa!


web socket/ real-time event juga bisa mengatasi concurrency risk
*/
@Injectable()
export class TasksService{

  constructor(
    private readonly supabase: SupabaseRequestService,
    private readonly taskStatus: TaskStatusService,
    private readonly ai: AiService,
  ) {}

  async createTask(projectId: string, dto: CreateTaskDto, userId: string) {
    const { assignee_ids, status_id:_, ...taskFields } = dto;

    // CHECK 1: Is the creator a project member?
    const creatorMember = await this.checkValidMember(userId, projectId)

    //check 2: valid project members!
    if(assignee_ids && assignee_ids.length > 0) {
        await this.validateProjectMembers(assignee_ids, projectId)
    }
    // todo as default 
    const targetStatusId = this.taskStatus.getStatusId('TODO');

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

    if(assignee_ids && assignee_ids.length > 0){
        await this.syncAssignees(createdTask.id, projectId, assignee_ids)
    }

    return {
      ...createdTask,
      assignees: assignee_ids || [],
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
  ) {
    const { assignee_ids, status_id, ...scalarFields } = dto;
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

    if(assignee_ids){
        await this.validateProjectMembers(assignee_ids, projectId)
    }
    if(status_id){
        await this.validateStatusTransition(taskId, projectId, status_id)
    }
    
    // Prepare object for fields to update in 'tasks' table
    const updatePayload: Record<string, any> = { ...scalarFields };


    if(status_id){
        updatePayload.status_id = status_id;
    }

    // PERFORM UPDATES
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
    if(assignee_ids !== undefined){
        await this.syncAssignees(taskId, projectId, assignee_ids)
    }

    return {
      ...updatedTask,
      assignees: assignee_ids ?? 'Unchanged',
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
  //1 member 
  private async checkValidMember(memberId: string, projectId: string) {
    const { data: member, error: memberError } = await this.supabase.client
      .from('project_members')
      .select('id')
      .or(`profile_id.eq.${memberId},id.eq.${memberId}`)
      .eq('project_id', projectId)
      .eq('membership_status', 'ACTIVE')
      .single();
    if (!member || memberError) {
      throw new NotFoundException('Target member not found in this project');
    }
    return member;
  }
  //bulk 
  private async validateProjectMembers(memberIds: string[], projectId:string){
    if (!memberIds || memberIds.length === 0) return;
    const uniqueIds = [...new Set(memberIds)];
    const { data: validMembers, error: validateError } = await this.supabase.client
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .in('id', uniqueIds)
      .eq('membership_status', 'ACTIVE');
    if (
      validateError ||
      !validMembers ||
      validMembers.length !== uniqueIds.length
    ) {
      throw new BadRequestException(
        'One or more assigned users are not active members of this project',
      );
    }
  }

  private async syncAssignees(taskId:string, projectId:string, assigneeIds?: string[]){
    if(assigneeIds === undefined) return;
    const {data: currentAssignees, error:assigneesError} = await this.supabase.client.from('task_assignees').select('project_member_id').eq('task_id',taskId)
    if(assigneesError) throw new BadRequestException('Failed to fetch current task assignees: '+ assigneesError.message)
    
    const currentMemberIds = currentAssignees?.map((c) => c.project_member_id) || []
    const targetMemberIds = assigneeIds.length > 0 ? [...new Set(assigneeIds)]: []
    if(targetMemberIds.length > 0){
        await this.validateProjectMembers(targetMemberIds, projectId)
    }

    const toAdd = targetMemberIds.filter((id) => !currentMemberIds.includes(id));
    const toDelete = currentMemberIds.filter((id) => !targetMemberIds.includes(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await this.supabase.client
        .from('task_assignees')
        .delete()
        .eq('task_id', taskId)
        .in('project_member_id', toDelete);
      if (deleteError) {
        throw new BadRequestException(
          'Failed to remove unassigned members: ' + deleteError.message,
        );
      }
    }
    if (toAdd.length > 0) {
      const newRows = toAdd.map((memberId) => ({
        task_id: taskId,
        project_member_id: memberId,
      }));
      const { error: insertError } = await this.supabase.client
        .from('task_assignees')
        .insert(newRows);
      if (insertError) {
        throw new BadRequestException(
          'Failed to assign new task members: ' + insertError.message,
        );
      }
    }
  }

  
    private async validateStatusTransition(
        taskId:string,
        projectId:string,
        targetStatusId:string
    ){
        const {data: task, error:taskError} = await this.supabase.client.from('tasks').select('task_statuses(code)').eq('id',taskId).eq('project_id',projectId).single()

        if(taskError || !task) throw new NotFoundException('Task not found!')
        const currentStatusCode = task.task_statuses.code 

        let targetStatusCode = '';
        for (const code of TASK_STATUS_CODES){
            if(this.taskStatus.getStatusId(code) === targetStatusId){
                targetStatusCode = code;
                break
            }
        }
        if(!targetStatusCode) throw new BadRequestException('Invalid target status ID') 
        
        if(currentStatusCode === 'DONE' && targetStatusCode !=='DONE'){
            throw new BadRequestException('Completed tasks are locked and cannot be moved back.')
        }
            //1. task yg in review cannot be dragged
        if(currentStatusCode === 'IN_REVIEW' && targetStatusCode !== 'IN_REVIEW'){
            throw new BadRequestException('Task in review cannot be dragged. Please use the review button inside task details!')
        }

        // panggil endpoint /review disitu soalnya update manual , bukan disini!
        if(targetStatusCode === 'DONE'){
            throw new BadRequestException('Cannot move task to Done manually. Leader must approve it via Review')
        }

        // harus ada proof of work kalo mau ke in review
        if(targetStatusCode === 'IN_REVIEW'){
            const {data: proofData} = await this.supabase.client.from('proof_of_works').select('id').eq('task_id',taskId).maybeSingle()
            if(!proofData){
                throw new BadRequestException('Please submit proof of work first before moving to In Review')
            }
        }

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

  // ai task recommendation
  async generateTasksFromAI(projectId:string){
    const {data:description, error:descriptionError} = await this.supabase.client.from('projects').select('background,objective,method').eq('id',projectId).single()
    if(!description|| descriptionError ) throw new BadRequestException('Failed to load project description: '+descriptionError.message)
    
    const {background, method, objective} = description
    if(!background?.trim() && !objective?.trim() && !method?.trim()){
      throw new BadRequestException(
        'At least one section (background, objective, ormethod) must be provided to generate AI tasks.'
      )
    }

    const text = `INFORMASI PROJECT: 
  - Background: ${background || 'tidak ada background'}\n
  - Objective: ${objective || 'tidak ada objective'}\n
  - Method: ${method || 'tidak ada method'}\n`.trim()
    const response =  await this.ai.generateasks(text)    
    return response
  }

  async createBulkTask(projectId:string, dto: BulkCreateTaskDto, userId:string){
    const creatorMember = await this.checkValidMember(userId, projectId)
    const {tasks} = dto
    const targetStatusId = this.taskStatus.getStatusId('TODO');


    const allAssigneeIds = [...new Set(tasks.flatMap((t) => t.assignee_ids || []))];

    if (allAssigneeIds.length > 0){
      await this.validateProjectMembers(allAssigneeIds, projectId)
    }

    const mappedTasks = tasks.map((t) => ({
      title: t.title,
      description : t.description,
      due_date : t.due_date,
      created_by_member_id: creatorMember.id,
      status_id: targetStatusId,
      project_id: projectId,
      source : "AI"
    }))

    

    const{data:datas, error} = await this.supabase.client.from('tasks').insert(mappedTasks).select()
    if(!datas || error) throw new BadRequestException('Failed to bulk insert tasks: '+error.message)
    
    const syncPromises = datas.map((newTask, index) => {
      const taskDto = tasks[index]
      if(taskDto.assignee_ids && taskDto.assignee_ids.length > 0){
        return this.syncAssignees(newTask.id, projectId, taskDto.assignee_ids)
      }
      return Promise.resolve()
    })
    await Promise.all(syncPromises)

    
    return {message: "Successfully bulk insert task!"}
  }
}
