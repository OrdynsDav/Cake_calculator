"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import "./Select.css";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export default function Select({
  id,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder = "Выберите...",
  className = "",
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ignoreRadixOpenRef = useRef(false);

  const rootProps =
    value !== undefined
      ? { value, onValueChange }
      : { defaultValue, onValueChange };

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setOpen(false);
      return;
    }

    if (ignoreRadixOpenRef.current) {
      ignoreRadixOpenRef.current = false;
      return;
    }

    setOpen(true);
  }

  function handleTriggerPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();

    ignoreRadixOpenRef.current = true;
    setOpen((current) => !current);
  }

  function handleTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <RadixSelect.Root
      {...rootProps}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        id={id}
        className={["select__trigger", className].filter(Boolean).join(" ")}
        onPointerDown={handleTriggerPointerDown}
        onClick={handleTriggerClick}
        disabled={disabled}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="select__icon" aria-hidden>
          <ChevronDown size={16} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className="select__content"
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className="select__viewport">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="select__item"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="select__indicator">
                  <Check size={14} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
