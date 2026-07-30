// import type { Metadata } from "next";

// import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
// import { AuthLayout } from "@/components/layout/AuthLayout";

// // Deliberately excluded from robots — this page is reached only by
// // someone who already knows the URL, never via a link, button, or nav
// // item anywhere in the public UI.
// export const metadata: Metadata = {
//   title: "Admin Sign In | ProctorEd",
//   robots: { index: false, follow: false },
// };

// export default function AdminLoginPage() {
//   return (
//     <AuthLayout
//       eyebrow="Admin"
//       title="Sign in to the admin console"
//       subtitle="Restricted access. Authorized administrators only."
//     >
//       <AdminLoginForm />
//     </AuthLayout>
//   );
// }




import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

// Deliberately excluded from robots — this page is reached only by
// someone who already knows the URL, never via a link, button, or nav
// item anywhere in the public UI.
export const metadata: Metadata = {
  title: "Admin Sign In | ProctorEd",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <AuthLayout
      eyebrowKey="auth.adminLogin.eyebrow"
      titleKey="auth.adminLogin.title"
      subtitleKey="auth.adminLogin.subtitle"
    >
      <AdminLoginForm />
    </AuthLayout>
  );
}
