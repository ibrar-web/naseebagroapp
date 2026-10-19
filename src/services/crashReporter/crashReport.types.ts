import type { Breadcrumb } from './breadcrumbs';

export type CrashSource = 'global' | 'render' | 'promise';

// Body of POST /app/crash-reports.
export type CrashReport = {
  client_report_id: string;
  error_name: string;
  message: string;
  stack: string | null;
  component_stack: string | null;
  is_fatal: boolean;
  source: CrashSource;
  screen: string | null;
  // Where it broke: app module (src/app/<module>), screen file, React
  // component and function, as far as the error tells us.
  module: string | null;
  screen_file: string | null;
  component: string | null;
  function_name: string | null;
  breadcrumbs: Breadcrumb[];
  app_version: string;
  build_number: string;
  platform: string;
  os_version: string;
  device_model: string;
  app_env: string;
  occurred_at: string;
};
