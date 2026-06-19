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
  aliases?: string[] | null;
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
  const [search, setSearch] = useState("");
  const selectedInstitution = useMemo(
    () => institutions.find((institution) => institution.id === value),
    [institutions, value],
  );
  const filteredInstitutions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const alphabetic = [...institutions].sort((a, b) => a.name.localeCompare(b.name));

    if (!normalizedSearch) {
      return alphabetic.slice(0, 80);
    }

    const score = (institution: InstitutionOption) => {
      const name = institution.name.toLowerCase();
      const aliases = (institution.aliases || []).map((alias) => alias.toLowerCase());
      const state = institution.state?.toLowerCase() || "";
      const region = institution.region?.toLowerCase() || "";
      const type = typeLabel[institution.institution_type || ""]?.toLowerCase() || "";

      if (name === normalizedSearch || aliases.includes(normalizedSearch)) return 0;
      if (aliases.some((alias) => alias.startsWith(normalizedSearch))) return 1;
      if (name.startsWith(normalizedSearch)) return 2;
      if (name.split(/\s+/).some((word) => word.startsWith(normalizedSearch))) return 3;
      if (aliases.some((alias) => alias.includes(normalizedSearch))) return 4;
      if (name.includes(normalizedSearch)) return 5;
      if (state.startsWith(normalizedSearch) || region.startsWith(normalizedSearch)) return 6;
      if (type.includes(normalizedSearch)) return 7;
      return 99;
    };

    return alphabetic
      .map((institution) => ({ institution, rank: score(institution) }))
      .filter((item) => item.rank < 99)
      .sort((a, b) => a.rank - b.rank || a.institution.name.localeCompare(b.institution.name))
      .slice(0, 30)
      .map((item) => item.institution);
  }, [institutions, search]);

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
              <span className="truncate font-medium">
                {selectedInstitution.name}
                {selectedInstitution.aliases?.[0] ? ` (${selectedInstitution.aliases[0]})` : ""}
              </span>
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
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type school name or short form..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-80">
            <CommandEmpty>No institution found.</CommandEmpty>
            <CommandGroup heading={search.trim() ? "Best matches" : "All institutions"}>
              {filteredInstitutions.map((institution) => {
                const label = typeLabel[institution.institution_type || ""] || "Institution";
                const searchValue = [
                  institution.name,
                  institution.state,
                  institution.region,
                  institution.ownership,
                  ...(institution.aliases || []),
                  label,
                ].filter(Boolean).join(" ");

                return (
                  <CommandItem
                    key={institution.id}
                    value={searchValue}
                    onSelect={() => {
                      onChange(institution.id);
                      setSearch("");
                      setOpen(false);
                    }}
                    className="items-start gap-3 py-3"
                  >
                    <School className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{institution.name}</span>
                        {institution.aliases?.[0] && (
                          <Badge variant="outline" className="text-[10px]">
                            {institution.aliases[0]}
                          </Badge>
                        )}
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
            {!search.trim() && institutions.length > filteredInstitutions.length && (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Showing alphabetically. Type a school name or short form to narrow results.
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
