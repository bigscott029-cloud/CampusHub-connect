import { Check, ChevronsUpDown, MapPin, School } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface InstitutionOption {
  id: string;
  name: string;
  institution_type?: string | null;
  ownership?: string | null;
  state?: string | null;
  region?: string | null;
}

interface InstitutionComboboxProps {
  disabled?: boolean;
  institutions: InstitutionOption[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

const typeLabel: Record<string, string> = {
  university: "University",
  polytechnic: "Polytechnic",
  college_of_education: "College",
  monotechnic: "Monotechnic",
  other: "Institution",
};

export function InstitutionCombobox({
  disabled,
  institutions,
  placeholder = "Search universities, polytechnics, colleges...",
  value,
  onChange,
}: InstitutionComboboxProps) {
  const [open, setOpen] = useState(false);
  const selectedInstitution = useMemo(
    () => institutions.find((institution) => institution.id === value),
    [institutions, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto min-h-11 w-full justify-between px-3 py-2 text-left font-normal"
          disabled={disabled}
        >
          {selectedInstitution ? (
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{selectedInstitution.name}</span>
              <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                {[selectedInstitution.state, selectedInstitution.region].filter(Boolean).join(" • ") || "Nigeria"}
              </span>
            </span>
          ) : (
            <span className="truncate text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(92vw,520px)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Type school, state, region, or institution type..." />
          <CommandList className="max-h-80">
            <CommandEmpty>No institution found.</CommandEmpty>
            <CommandGroup>
              {institutions.map((institution) => {
                const label = typeLabel[institution.institution_type || ""] || "Institution";
                const searchValue = [
                  institution.name,
                  institution.state,
                  institution.region,
                  institution.ownership,
                  label,
                ].filter(Boolean).join(" ");

                return (
                  <CommandItem
                    key={institution.id}
                    value={searchValue}
                    onSelect={() => {
                      onChange(institution.id);
                      setOpen(false);
                    }}
                    className="items-start gap-3 py-3"
                  >
                    <School className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{institution.name}</span>
                        <Check className={cn("h-4 w-4", value === institution.id ? "opacity-100" : "opacity-0")} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">
                          {label}
                        </Badge>
                        {institution.ownership && <span>{institution.ownership}</span>}
                        {institution.state && <span>{institution.state}</span>}
                        {institution.region && <span>{institution.region}</span>}
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
