/** TAPD 通用分页参数 */
export interface PageParams {
  limit?: number;
  page?: number;
  order?: string;
  fields?: string;
}

/** TAPD API 响应结构 */
export interface TapdResponse<T> {
  status: number;
  info: string;
  data: T;
}

/** 需求 — https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/story/get_stories.html */
export interface Story {
  id: string;
  name: string;
  workspace_id: string;
  status: string;
  owner: string;
  creator: string;
  created: string;
  modified: string;
  description: string | null;
  priority: string;
  priority_label?: string;
  iteration_id: string;
  begin: string | null;
  due: string | null;
  completed: string | null;
  developer: string;
  cc: string;
  module: string;
  version: string;
  category_id: string;
  parent_id: string;
  children_id: string;
  ancestor_id: string;
  business_value: string;
  effort: string | null;
  effort_completed: string;
  remain: string;
  exceed: string;
  [key: `custom_field_${string}`]: string | null | undefined;
}

export interface GetStoriesParams extends PageParams {
  id?: string | number;
  name?: string;
  status?: string;
  v_status?: string;
  with_v_status?: string;
  owner?: string;
  creator?: string;
  developer?: string;
  iteration_id?: string;
  include_sub_iteration?: string;
  category_id?: number;
  parent_id?: number;
  ancestor_id?: number;
  description?: string;
  priority_label?: string;
  label?: string;
  workitem_type_id?: string;
  created?: string;
  modified?: string;
  completed?: string;
  begin?: string;
  due?: string;
}

/** 迭代 — https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/iteration/get_iterations.html */
export interface Iteration {
  id: string;
  name: string;
  workspace_id: string;
  description: string | null;
  startdate: string;
  enddate: string;
  status: string;
  creator: string;
  created: string;
  modified: string;
  completed: string | null;
  locker: string | null;
  lock_info?: string | null;
  workitem_type_id?: string;
  plan_app_id?: string | null;
  release_id?: string | null;
  [key: `custom_field_${number}`]: string | null | undefined;
}

export interface GetIterationsParams extends PageParams {
  id?: string | number;
  name?: string;
  status?: string;
  creator?: string;
  startdate?: string;
  enddate?: string;
  created?: string;
  modified?: string;
  completed?: string;
  workitem_type_id?: number;
  plan_app_id?: number;
}

export interface AuthTestResult {
  api_user: string;
  api_password: string;
  request_ip: string;
}
