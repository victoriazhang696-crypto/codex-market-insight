import LoginForm from './login-form';

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    reason?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  return <LoginForm searchParams={(await searchParams) ?? {}} />;
}
