import BackButton from "@/components/breadcrumbs";

export default function ProfileWrapper({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col w-full py-12 items-center justify-center">
      <div className="md:w-3/4 w-full flex flex-col">
        <div className="w-full flex items-end justify-between border-b pb-4">
          <h1 className="text-2xl md:text-5xl font-bold uppercase">{title}</h1>
          <BackButton />
        </div>
        {children}
      </div>
    </div>
  );
}
