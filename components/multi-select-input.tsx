"use client";
import { INPUT_MAX } from "@/lib/input-limits";
import { XIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  name: string;
  defaultValues?: string[];
  maxOptions?: number;
  maxOptionLength?: number;
};

export default function MultiSelectInput({
  defaultValues,
  name,
  maxOptions = 5,
  maxOptionLength = INPUT_MAX.influence,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [addedOptions, setAddedOptions] = useState<string[]>(
    defaultValues || [],
  );

  const addOption = (raw: string) => {
    const value = raw.trim().slice(0, maxOptionLength);
    if (
      !value ||
      addedOptions.length >= maxOptions ||
      addedOptions.includes(value)
    ) {
      return;
    }
    setAddedOptions([...addedOptions, value]);
    setInputValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    // Prevent submitting the parent form
    e.preventDefault();
    addOption(inputValue);
  };

  const onDelete = (option: string) => {
    setAddedOptions(addedOptions.filter((o) => o !== option));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 w-full border-b pb-2">
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            placeholder="Add an option"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            value={inputValue}
            maxLength={maxOptionLength}
            className="w-full focus:outline-0 hover:outline-0 focus:ring-0 hover:ring-0"
          />
          <button
            type="button"
            disabled={!inputValue.trim() || addedOptions.length >= maxOptions}
            onClick={() => addOption(inputValue)}
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
                type="button"
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
      <div>
        <p className="text-xs text-gray-500">
          {addedOptions.length} / {maxOptions}
        </p>
      </div>
    </div>
  );
}
