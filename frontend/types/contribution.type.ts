type GetContributionsPayload = {
  id: string;
  title: string;
  type: string;
  created_at: string;
  created_by: {
    profiles: {
      name: string;
      profile_image_url: string;
    };
  };
};

type GetContributionByIdPayload = {
  id: string;
  project_id: string;
  created_by_member_id: string;
  title: string;
  type: string;
  content_json: {
    project_id: string;
    generated_at: string;
    total_project_tasks: number;
    member_contribution: [
      {
        name: string;
        role: string;
        member_id: string;
        average_rating: number;
        total_assigned: number;
        completed_count: number;
        completed_titles: string[];
      },
    ];
  };
};
