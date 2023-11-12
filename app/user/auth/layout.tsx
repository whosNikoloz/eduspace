export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <main>{children}</main>
    </div>
  );
}
