
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';

const SignIn = () => {
  return (
    <AuthLayout mode="signin">
      <AuthForm type="signin" />
    </AuthLayout>
  );
};

export default SignIn;
