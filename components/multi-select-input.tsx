"use client";
import { XIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  name: string;
  defaultValues?: string[];
};

export default function MultiSelectInput({ defaultValues, name }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [addedOptions, setAddedOptions] = useState<string[]>(
    defaultValues || [],
  );
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim()) {
      setInputValue(value);
    }
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setAddedOptions([...addedOptions, e.currentTarget.value]);
      setInputValue("");
    }
  };

  const onAdd = () => {
    if (inputValue.trim()) {
      setAddedOptions([...addedOptions, inputValue]);
      setInputValue("");
    }
  };

  const onDelete = (option: string) => {
    setAddedOptions(addedOptions.filter((o) => o !== option));
  };
  return (
    <div className="flex flex-col gap-2 w-full border-b pb-2">
      <div className="flex items-center gap-2 w-full">
        <input
          type="text"
          placeholder="Add an option"
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={inputValue}
          className="w-full focus:outline-0 hover:outline-0 focus:ring-0 hover:ring-0"
        />
        <button
          type="button"
          disabled={!inputValue.trim()}
          onClick={() => onAdd()}
          className="hover:cursor-pointer"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {addedOptions.map((option) => (
          <div
            key={option}
            className="flex items-center gap-2 bg-amber-500/20 px-2 py-1 rounded-md border text-sm"
          >
            <span>{option}</span>
            <button
              onClick={() => onDelete(option)}
              className="hover:cursor-pointer"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <input type="hidden" name={name} value={addedOptions.join(",")} />
    </div>
  );
}
