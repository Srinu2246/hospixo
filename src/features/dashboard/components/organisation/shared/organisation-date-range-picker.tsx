'use client';

import { orgDash } from '@/features/dashboard/styles/org-dash-classes';

import { useEffect, useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

type PresetRangeId = Exclude<OrganisationDateRangeId, 'custom'>;

type OrganisationDateRangePickerProps = Readonly<{
  label: string;
  activeRange: OrganisationDateRangeId;
  customFrom: string;
  customTo: string;
  isOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onSelectPreset: (range: PresetRangeId) => void;
  onApplyCustom: (from: string, to: string) => void;
}>;

export function OrganisationDateRangePicker({
  label,
  activeRange,
  customFrom,
  customTo,
  isOpen,
  menuRef,
  onToggle,
  onSelectPreset,
  onApplyCustom,
}: OrganisationDateRangePickerProps) {
  const [customPanelOpen, setCustomPanelOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(customFrom);
  const [draftTo, setDraftTo] = useState(customTo);

  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (!isOpen) {
      setCustomPanelOpen(false);
    } else {
      setDraftFrom(customFrom);
      setDraftTo(customTo);
      setCustomPanelOpen(activeRange === 'custom');
    }
  }

  function handlePresetSelect(range: OrganisationDateRangeId) {
    if (range === 'custom') {
      setCustomPanelOpen(true);
      return;
    }

    onSelectPreset(range);
  }

  function handleApplyCustom() {
    if (!draftFrom || !draftTo) return;

    const from = draftFrom <= draftTo ? draftFrom : draftTo;
    const to = draftFrom <= draftTo ? draftTo : draftFrom;
    onApplyCustom(from, to);
  }

  return (
    <div className={orgDash.rangeWrap} ref={menuRef}>
      <button
        type="button"
        className={orgDash.rangeTrigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <Calendar className={orgDash.rangeIcon} aria-hidden />
        <span>{label}</span>
        <ChevronDown className={orgDash.rangeChevron} aria-hidden size={16} />
      </button>
      {isOpen ? (
        <div className={orgDash.rangeMenu} role="listbox" aria-label="Date range">
          {organisationDashboardCopy.dateRangeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={activeRange === option.id}
              className={
                activeRange === option.id ? orgDash.rangeMenuitemactive : orgDash.rangeMenuitem
              }
              onClick={() => handlePresetSelect(option.id)}
            >
              {option.label}
            </button>
          ))}

          {customPanelOpen ? (
            <div className={orgDash.rangeCustompanel}>
              <label className={orgDash.rangeDatefield}>
                <span className={orgDash.rangeDatelabel}>From</span>
                <input
                  type="date"
                  className={orgDash.rangeDateinput}
                  value={draftFrom}
                  max={draftTo || undefined}
                  onChange={(event) => setDraftFrom(event.target.value)}
                />
              </label>
              <label className={orgDash.rangeDatefield}>
                <span className={orgDash.rangeDatelabel}>To</span>
                <input
                  type="date"
                  className={orgDash.rangeDateinput}
                  value={draftTo}
                  min={draftFrom || undefined}
                  onChange={(event) => setDraftTo(event.target.value)}
                />
              </label>
              <button
                type="button"
                className={orgDash.rangeApplybutton}
                disabled={!draftFrom || !draftTo}
                onClick={handleApplyCustom}
              >
                Apply range
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
