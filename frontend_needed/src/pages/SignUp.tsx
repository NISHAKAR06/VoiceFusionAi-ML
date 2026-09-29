
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';

const SignUp = () => {
  return (
    <AuthLayout mode="signup">
      <AuthForm type="signup" />
    </AuthLayout>
  );
};

export default SignUp;
