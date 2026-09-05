import { ComponentPropsWithoutRef } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type SelectOptionGroup = {
  label: string;
  options: SelectOption[];
};

function OptionList({
  options,
  groups,
}: {
  options?: SelectOption[];
  groups?: SelectOptionGroup[];
}) {
  if (groups?.length) {
    return groups.map((group) => (
      <optgroup key={group.label} label={group.label}>
        <option value="">Select an option</option>
        {group.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </optgroup>
    ));
  }

  return (options ?? []).map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ));
}

export default function SelectInput({
  label,
  isPending,
  name,
  options,
  groups,
  isEdit = false,
  ...props
}: ComponentPropsWithoutRef<"select"> & {
  label?: string;
  isPending: boolean;
  name: string;
  options?: SelectOption[];
  groups?: SelectOptionGroup[];
  isEdit?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <div className="flex relative">
          <label htmlFor={name} className="ml-2  text-sm font-semibold">
            {label}
          </label>
        </div>
      )}
      {isEdit ? (
        <div className="flex items-center gap-1 w-full">
          <select
            {...props}
            name={name}
            disabled={isPending}
            className="border-0 disabled:opacity-50 focus:outline-none transition-all py-1 w-full"
          >
            <OptionList options={options} groups={groups} />
          </select>
        </div>
      ) : (
        <select
          {...props}
          name={name}
          disabled={isPending}
          className="border rounded-md py-4.5 px-2 disabled:opacity-50 focus:outline-none transition-all "
        >
          <OptionList options={options} groups={groups} />
        </select>
      )}
    </div>
  );
}
