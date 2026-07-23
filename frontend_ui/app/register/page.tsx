// import type { Metadata } from "next";

// import { RegisterForm } from "@/components/auth/RegisterForm";
// import { AuthLayout } from "@/components/layout/AuthLayout";

// export const metadata: Metadata = {
//   title: "Create account | ProctorEd",
// };

// export default function RegisterPage() {
//   return (
//     <AuthLayout
//       eyebrow="Get started"
//       title="Create your account"
//       subtitle="Set up access for your exams, question banks, and dashboards."
//     >
//       <RegisterForm />
//     </AuthLayout>
//   );
// }





import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export const metadata: Metadata = {
  title: "Create account | ProctorEd",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Set up access for your exams, question banks, and dashboards."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
