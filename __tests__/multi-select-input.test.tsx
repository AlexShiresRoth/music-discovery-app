import MultiSelectInput from "@/components/multi-select-input";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

function getTextInput() {
  return screen.getByPlaceholderText("Add an option") as HTMLInputElement;
}

function getHiddenInput(name = "influences") {
  return document.querySelector(
    `input[type="hidden"][name="${name}"]`,
  ) as HTMLInputElement;
}

function getAddButton() {
  return screen.getByRole("button", { name: "Add" });
}

function typeAndAdd(value: string) {
  fireEvent.change(getTextInput(), { target: { value } });
  fireEvent.click(getAddButton());
}

describe("MultiSelectInput", () => {
  it("renders default values, counter, and hidden field", () => {
    render(
      <MultiSelectInput
        name="influences"
        defaultValues={["Radiohead", "Bjork"]}
        maxOptions={5}
      />,
    );

    expect(screen.getByText("Radiohead")).toBeDefined();
    expect(screen.getByText("Bjork")).toBeDefined();
    expect(screen.getByText("2 / 5")).toBeDefined();
    expect(getHiddenInput().value).toBe("Radiohead,Bjork");
    expect(getAddButton().disabled).toBe(true);
  });

  it("adds an option with the Add button and clears the text input", () => {
    render(<MultiSelectInput name="influences" />);

    typeAndAdd("FKA twigs");

    expect(screen.getByText("FKA twigs")).toBeDefined();
    expect(getTextInput().value).toBe("");
    expect(getHiddenInput().value).toBe("FKA twigs");
    expect(screen.getByText("1 / 5")).toBeDefined();
  });

  it("adds an option on Enter and prevents parent form submit", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

    render(
      <form onSubmit={onSubmit}>
        <MultiSelectInput name="influences" />
        <button type="submit">Save</button>
      </form>,
    );

    fireEvent.change(getTextInput(), { target: { value: "Aphex Twin" } });
    fireEvent.keyDown(getTextInput(), { key: "Enter" });

    expect(screen.getByText("Aphex Twin")).toBeDefined();
    expect(getHiddenInput().value).toBe("Aphex Twin");
    expect(getTextInput().value).toBe("");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("trims whitespace before adding", () => {
    render(<MultiSelectInput name="influences" />);

    typeAndAdd("  Portishead  ");

    expect(screen.getByText("Portishead")).toBeDefined();
    expect(getHiddenInput().value).toBe("Portishead");
  });

  it("does not add empty or whitespace-only values", () => {
    render(<MultiSelectInput name="influences" />);

    fireEvent.keyDown(getTextInput(), { key: "Enter" });
    expect(getHiddenInput().value).toBe("");
    expect(screen.getByText("0 / 5")).toBeDefined();

    fireEvent.change(getTextInput(), { target: { value: "   " } });
    expect(getAddButton().disabled).toBe(true);
    fireEvent.click(getAddButton());
    expect(getHiddenInput().value).toBe("");
  });

  it("does not add duplicate options", () => {
    render(
      <MultiSelectInput name="influences" defaultValues={["Radiohead"]} />,
    );

    typeAndAdd("Radiohead");

    expect(screen.getAllByText("Radiohead")).toHaveLength(1);
    expect(getHiddenInput().value).toBe("Radiohead");
    expect(screen.getByText("1 / 5")).toBeDefined();
    expect(getTextInput().value).toBe("Radiohead");
  });

  it("respects maxOptions and disables Add at the limit", () => {
    render(
      <MultiSelectInput
        name="influences"
        defaultValues={["One", "Two"]}
        maxOptions={2}
      />,
    );

    expect(screen.getByText("2 / 2")).toBeDefined();

    fireEvent.change(getTextInput(), { target: { value: "Three" } });
    expect(getAddButton().disabled).toBe(true);
    fireEvent.click(getAddButton());
    fireEvent.keyDown(getTextInput(), { key: "Enter" });

    expect(screen.queryByText("Three")).toBeNull();
    expect(getHiddenInput().value).toBe("One,Two");
  });

  it("removes an option and updates the hidden field and counter", () => {
    render(
      <MultiSelectInput
        name="influences"
        defaultValues={["Radiohead", "Bjork"]}
      />,
    );

    const removeButtons = screen
      .getAllByRole("button")
      .filter((button) => button !== getAddButton());

    fireEvent.click(removeButtons[0]!);

    expect(screen.queryByText("Radiohead")).toBeNull();
    expect(screen.getByText("Bjork")).toBeDefined();
    expect(getHiddenInput().value).toBe("Bjork");
    expect(screen.getByText("1 / 5")).toBeDefined();
  });
});
