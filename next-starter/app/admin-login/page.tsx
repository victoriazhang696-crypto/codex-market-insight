import AdminLoginForm from './admin-login-form';

type AdminLoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    reason?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  return <AdminLoginForm searchParams={(await searchParams) ?? {}} />;
}
