export default function EditWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen">
      <div className="md:w-1/2 w-full py-12">{children}</div>
    </div>
  );
}
