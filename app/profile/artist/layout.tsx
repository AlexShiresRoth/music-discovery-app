export default async function ProfileLayout({
  children,
  edit,
}: {
  children: React.ReactNode;
  edit: React.ReactNode;
}) {
  return (
    <>
      {children}
      {edit}
    </>
  );
}
