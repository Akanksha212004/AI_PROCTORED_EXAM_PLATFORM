// import type { Metadata } from "next";

// import { ExaminerRequestStatusForm } from "@/components/auth/ExaminerRequestStatusForm";
// import { AuthLayout } from "@/components/layout/AuthLayout";

// export const metadata: Metadata = {
//   title: "Request Status | ProctorEd",
// };

// export default function ExaminerRequestStatusPage() {
//   return (
//     <AuthLayout
//       eyebrow="Examiner Portal"
//       title="Check your request status"
//       subtitle="Enter your official email or request ID to see where your application stands."
//     >
//       <ExaminerRequestStatusForm />
//     </AuthLayout>
//   );
// }




import type { Metadata } from "next";

import { ExaminerRequestStatusForm } from "@/components/auth/ExaminerRequestStatusForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export const metadata: Metadata = {
  title: "Request Status | ProctorEd",
};

export default function ExaminerRequestStatusPage() {
  return (
    <AuthLayout
      eyebrowKey="auth.requestStatus.eyebrow"
      titleKey="auth.requestStatus.title"
      subtitleKey="auth.requestStatus.subtitle"
    >
      <ExaminerRequestStatusForm />
    </AuthLayout>
  );
}
