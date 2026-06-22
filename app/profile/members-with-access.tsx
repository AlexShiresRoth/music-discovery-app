type Props = {
  membersWithAccess: string[];
};

// TODO - how can we get other members by id?
export default function MembersWithAccess({ membersWithAccess }: Props) {
  return (
    <div>
      {membersWithAccess.map((member) => {
        return <div key={member}>Me</div>;
      })}
    </div>
  );
}
