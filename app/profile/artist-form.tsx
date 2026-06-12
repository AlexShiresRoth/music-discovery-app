"use client";

import { STATES } from "@/constants";
import { useState } from "react";
import { artistFormFields } from "./schemas";

function InputWithLabel({
  label,
  children,
  name,
}: {
  name: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name}>{label}</label>
      {children}
    </div>
  );
}

export default function ArtistProfileForm() {
  const fields = artistFormFields;
  const [pending, setIsFormPending] = useState(false);

  return (
    <div>
      <h1>Artist Profile</h1>
      <form className="flex flex-col gap-2">
        <InputWithLabel
          label={fields.fullName.label}
          name={fields.fullName.name}
        >
          <input
            type="text"
            name={fields.fullName.name}
            placeholder={fields.fullName.placeholder}
          />
        </InputWithLabel>
        <InputWithLabel
          label={fields.contactEmail.label}
          name={fields.contactEmail.name}
        >
          <input
            type="email"
            name={fields.contactEmail.name}
            placeholder={fields.contactEmail.placeholder}
          />
        </InputWithLabel>
        <InputWithLabel label={fields.city.label} name={fields.city.name}>
          <input
            type="text"
            name={fields.city.name}
            placeholder={fields.city.placeholder}
          />
        </InputWithLabel>
        <InputWithLabel label={fields.state.label} name={fields.state.name}>
          <select name={fields.state.name}>
            <option value="">Select a state</option>
            {STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </InputWithLabel>
        <button type="submit">Create Profile</button>
      </form>
    </div>
  );
}
