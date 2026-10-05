'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, ChevronDown, Mail, Phone } from 'lucide-react';
import { useEffect, useMemo, useState, useTransition } from 'react';

import type { PermissionGroup } from '@/features/user-roles/config/roles';
import {
  getTeamUserAvatarSrc,
  roleOptions,
  type UserRole,
  type UserStatus,
} from '@/features/user-roles/config/users';
import { filterPermissionGroupsToCodes } from '@/lib/roles-map';
import { fetchRole, fetchRolesList } from '@/lib/roles';
import { PermissionsAccordionGrid } from '@/features/user-roles/components/shared/permissions-accordion-grid';
import { UserAvatar } from '@/features/user-roles/components/shared/user-avatar';
import { WizardBreadcrumb } from '@/features/user-roles/components/shared/wizard-breadcrumb';
import {
  notifyStaffProfileUpdated,
  useMergedTeamUser,
} from '@/features/user-roles/hooks/use-merged-team-users';
import { saveStaffProfileOverride } from '@/features/user-roles/lib/staff-profile-store';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import { toApiRoleCode } from '@/lib/users-map';

import {
  replaceUserRolesAction,
  updateUserAction,
  updateUserStatusAction,
} from '@/lib/users-actions';
import type { EditStaffPageData } from '@/lib/users-server';

import accordionStyles from '../create-role/permissions-accordion.module.css';
import styles from './edit-staff-page.module.css';

const departments = [
  'Kitchen',
  'Operations',
  'Management',
  'Front of House',
  'Finance',
  'Inventory',
];

const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Seasonal'];

interface EditStaffFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  startDate: string;
  employmentType: string;
  roleName: string;
  description: string;
}

interface EditStaffPageProps {
  staffId: string;
  initialData: EditStaffPageData;
}

function toServerBaseline(
  data: EditStaffPageData,
): (Partial<EditStaffFormValues> & { status?: UserStatus }) | null {
  if (!data.staff) return null;

  const mapped = data.staff;

  return {
    firstName: mapped.firstName,
    lastName: mapped.lastName,
    email: mapped.email,
    phone: mapped.phone,
    role: mapped.role,
    status: mapped.status,
    startDate: mapped.createdAt ? new Date(mapped.createdAt).toLocaleDateString() : '',
  };
}

export function EditStaffPage({ staffId, initialData }: Readonly<EditStaffPageProps>) {
  const router = useRouter();
  const { employeesHref, viewStaffPrefix } = useUsersRolesNav();

  const [isSaving, startSaveTransition] = useTransition();
  const [isStatusPending, startStatusTransition] = useTransition();

  /*
   * Server-loaded staff data.
   *
   * useMergedTeamUser is still useful for feature-level information
   * such as avatar, department and other UI metadata.
   */
  const staff = useMergedTeamUser(staffId);

  const serverBaseline = useMemo(() => toServerBaseline(initialData), [initialData]);

  const initialStatus: UserStatus =
    (initialData.staff?.status as UserStatus | undefined) ??
    (staff?.status as UserStatus | undefined) ??
    'active';
  const [currentStatus, setCurrentStatus] = useState<UserStatus>(initialStatus);

  const baseline = useMemo<EditStaffFormValues>(
    () => ({
      firstName: serverBaseline?.firstName ?? staff?.firstName ?? '',

      lastName: serverBaseline?.lastName ?? staff?.lastName ?? '',

      email: serverBaseline?.email ?? staff?.email ?? '',

      phone: serverBaseline?.phone ?? staff?.phone ?? '',

      role: serverBaseline?.role ?? staff?.role ?? '',

      department: staff?.department ?? 'Operations',

      startDate: serverBaseline?.startDate ?? staff?.startDate ?? '',

      employmentType: staff?.employmentType ?? 'Full-time',

      roleName: serverBaseline?.role ?? staff?.role ?? '',

      description: '',
    }),
    [serverBaseline, staff],
  );

  const [overrides, setOverrides] = useState<Partial<EditStaffFormValues>>({});

  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
    () => initialData.permissionGroups ?? [],
  );
  const [liveRoleOptions, setLiveRoleOptions] = useState<
    Array<{ value: string; label: string; code: string }>
  >([]);
  const permissionCatalog = initialData.permissionCatalog ?? [];

  const [error, setError] = useState<string | null>(initialData.error);

  useEffect(() => {
    void fetchRolesList()
      .then((rolesRes) => {
        setLiveRoleOptions(
          rolesRes.items
            .filter((item) => item.status === 'active')
            .map((item) => ({
              value: String(item.id ?? ''),
              label: item.display_name,
              code: item.code,
            }))
            .filter((item) => item.value && item.label),
        );
      })
      .catch(() => {
        setLiveRoleOptions([]);
      });
  }, []);

  const [message, setMessage] = useState<string | null>(null);

  const firstName = overrides.firstName ?? baseline.firstName;

  const lastName = overrides.lastName ?? baseline.lastName;

  const email = overrides.email ?? baseline.email;

  const phone = overrides.phone ?? baseline.phone;

  const role = overrides.role ?? baseline.role;

  useEffect(() => {
    const selected = liveRoleOptions.find((option) => option.label === role);
    if (!selected?.value || permissionCatalog.length === 0) return;

    let cancelled = false;
    void fetchRole(selected.value)
      .then((roleDetail) => {
        if (cancelled) return;
        const scoped = filterPermissionGroupsToCodes(
          permissionCatalog,
          roleDetail.permission_codes ?? [],
        ).map((group) => ({
          ...group,
          permissions: group.permissions.map((permission) => ({
            ...permission,
            enabled: true,
          })),
        }));
        setPermissionGroups(scoped);
      })
      .catch(() => {
        if (!cancelled) setPermissionGroups([]);
      });

    return () => {
      cancelled = true;
    };
  }, [liveRoleOptions, permissionCatalog, role]);

  const department = overrides.department ?? baseline.department;

  const startDate = overrides.startDate ?? baseline.startDate;

  const employmentType = overrides.employmentType ?? baseline.employmentType;

  const roleName = overrides.roleName ?? baseline.roleName;

  const description = overrides.description ?? baseline.description;

  const setField = <K extends keyof EditStaffFormValues>(key: K, value: EditStaffFormValues[K]) => {
    setOverrides((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const viewHref = `${viewStaffPrefix}/${staffId}`;

  const avatarSrc = staff ? getTeamUserAvatarSrc(staff) : undefined;

  const namesChanged = firstName !== baseline.firstName || lastName !== baseline.lastName;

  function setPermissionEnabled(groupId: string, permissionId: string, enabled: boolean) {
    setPermissionGroups((groups) =>
      groups.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              permissions: group.permissions.map((permission) =>
                permission.id === permissionId
                  ? {
                      ...permission,
                      enabled,
                    }
                  : permission,
              ),
            },
      ),
    );
  }

  function toggleAllInGroup(groupId: string, enabled: boolean) {
    setPermissionGroups((groups) =>
      groups.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              permissions: group.permissions.map((permission) => ({
                ...permission,
                enabled,
              })),
            },
      ),
    );
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setMessage(null);

    startSaveTransition(async () => {
      /*
       * Server Action.
       *
       * Browser
       *   ↓
       * updateUserAction()
       *   ↓
       * server/API layer
       *   ↓
       * backend
       */
      const result = await updateUserAction(staffId, {
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        phone: phone.trim() || null,
      });

      if (!result.ok) {
        setError(result.message ?? 'Unable to update user.');
        return;
      }

      /*
       * If role was changed, persist to backend via PUT /api/v1/users/{id}/roles
       */
      if (role && role !== baseline.role) {
        const roleCode = toApiRoleCode(role);
        const roleResult = await replaceUserRolesAction(staffId, {
          roles: [roleCode],
        });

        if (!roleResult.ok) {
          setError(roleResult.message ?? 'User profile updated, but unable to update role.');
          return;
        }
      }

      /*
       * Save UI/feature-level metadata overrides (department, employmentType, startDate, role)
       */
      saveStaffProfileOverride(staffId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        role: role as UserRole,
        department,
        employmentType,
        startDate,
      });

      notifyStaffProfileUpdated();

      sessionStorage.removeItem('hospixo.add-user');

      setMessage('Staff member updated.');

      router.refresh();
    });
  }

  function handleToggleStatus() {
    setError(null);
    setMessage(null);

    const nextStatus: UserStatus = currentStatus === 'active' ? 'disabled' : 'active';

    startStatusTransition(async () => {
      const result = await updateUserStatusAction(staffId, {
        status: nextStatus,
      });

      if (!result.ok) {
        setError(
          result.message ??
            (nextStatus === 'disabled' ? 'Unable to deactivate user.' : 'Unable to activate user.'),
        );
        return;
      }

      setCurrentStatus(nextStatus);
      notifyStaffProfileUpdated();

      setMessage(
        nextStatus === 'disabled' ? 'Staff member deactivated.' : 'Staff member activated.',
      );

      router.refresh();
    });
  }

  if (error && !serverBaseline && !staff) {
    return (
      <div className={styles.page}>
        <header className={styles.topBar}>
          <Link href={employeesHref} className={styles.back}>
            <ArrowLeft size={18} />
            <span>Back to Users & Roles</span>
          </Link>
        </header>

        <p className={styles.dangerText} role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (!serverBaseline && !staff) {
    return (
      <div className={styles.page}>
        <p className={styles.sectionTitle} role="status">
          User not found.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <WizardBreadcrumb
        items={[
          {
            label: 'Edit Staff Profile',
          },
        ]}
      />

      <div className={styles.body}>
        <header className={styles.topBar}>
          <div className={styles.titleRow}>
            <Link href={viewHref} className={styles.back} aria-label="Back to profile">
              <ArrowLeft size={18} />
            </Link>

            <UserAvatar
              firstName={firstName}
              lastName={lastName}
              src={avatarSrc}
              preferInitials={namesChanged}
              color={staff?.avatarColor}
              size="lg"
            />

            <div>
              <div className={styles.titleWithBadge}>
                <h1 className={styles.pageTitle}>Edit Staff Profile</h1>
                <span
                  className={`${styles.statusBadge} ${
                    currentStatus === 'active'
                      ? styles.statusBadgeActive
                      : styles.statusBadgeDisabled
                  }`}
                >
                  <span
                    className={`${styles.statusDot} ${
                      currentStatus === 'active' ? styles.statusDotActive : styles.statusDotDisabled
                    }`}
                  />
                  {currentStatus === 'active' ? 'Active' : 'Disabled'}
                </span>
              </div>

              <p className={styles.pageSubtitle}>
                {firstName} {lastName}
              </p>
            </div>
          </div>
        </header>

        {error ? (
          <p className={styles.dangerText} role="alert">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className={styles.sectionTitle} role="status">
            {message}
          </p>
        ) : null}

        <form className={styles.card} onSubmit={handleSave}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>

            <div className={styles.grid2}>
              <label className={styles.field}>
                <span className={styles.label}>First Name</span>

                <input
                  className={styles.input}
                  value={firstName}
                  onChange={(event) => setField('firstName', event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Last Name</span>

                <input
                  className={styles.input}
                  value={lastName}
                  onChange={(event) => setField('lastName', event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Email Address</span>

                <span className={styles.inputWithIcon}>
                  <Mail size={16} className={styles.fieldIcon} />

                  <input type="email" className={styles.inputIcon} value={email} readOnly />
                </span>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Phone Number</span>

                <span className={styles.inputWithIcon}>
                  <Phone size={16} className={styles.fieldIcon} />

                  <input
                    className={styles.inputIcon}
                    value={phone}
                    onChange={(event) => setField('phone', event.target.value)}
                  />
                </span>
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Employment Details</h2>

            <div className={styles.grid2}>
              <label className={styles.field}>
                <span className={styles.label}>Role</span>

                <span className={styles.selectWrap}>
                  <select
                    className={styles.select}
                    value={role}
                    onChange={(event) => setField('role', event.target.value)}
                  >
                    {role &&
                    !liveRoleOptions.some((option) => option.label === role) &&
                    !roleOptions.includes(role as UserRole) ? (
                      <option value={role}>{role}</option>
                    ) : null}

                    {(liveRoleOptions.length > 0
                      ? liveRoleOptions.map((option) => option.label)
                      : roleOptions
                    ).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={16} className={styles.selectIcon} />
                </span>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Department</span>

                <span className={styles.selectWrap}>
                  <select
                    className={styles.select}
                    value={department}
                    onChange={(event) => setField('department', event.target.value)}
                  >
                    {departments.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={16} className={styles.selectIcon} />
                </span>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Start Date</span>

                <span className={styles.inputWithIcon}>
                  <input
                    className={styles.inputIconRight}
                    value={startDate}
                    onChange={(event) => setField('startDate', event.target.value)}
                  />

                  <Calendar size={16} className={styles.fieldIconRight} />
                </span>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Employment Type</span>

                <span className={styles.selectWrap}>
                  <select
                    className={styles.select}
                    value={employmentType}
                    onChange={(event) => setField('employmentType', event.target.value)}
                  >
                    {employmentTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={16} className={styles.selectIcon} />
                </span>
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Configure Permissions</h2>

            <div className={accordionStyles.metaGrid}>
              <label className={accordionStyles.field}>
                <span className={accordionStyles.label}>Role Name</span>

                <input
                  className={accordionStyles.input}
                  value={roleName}
                  onChange={(event) => setField('roleName', event.target.value)}
                />
              </label>

              <label className={accordionStyles.field}>
                <span className={accordionStyles.label}>Description</span>

                <input
                  className={accordionStyles.input}
                  value={description}
                  onChange={(event) => setField('description', event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={accordionStyles.sectionTitle}>Permissions</h2>

            {permissionGroups.length === 0 ? (
              <p className={accordionStyles.error} role="status">
                No permissions assigned for this role.
              </p>
            ) : (
              <PermissionsAccordionGrid
                permissionGroups={permissionGroups}
                onPermissionEnabled={setPermissionEnabled}
                onToggleAllInGroup={toggleAllInGroup}
              />
            )}
          </section>

          <section className={styles.danger}>
            <h2 className={styles.dangerTitle}>
              {currentStatus === 'active' ? 'Deactivate User' : 'Activate User'}
            </h2>

            <p className={styles.dangerText}>
              {currentStatus === 'active'
                ? 'Deactivating this staff member disables their system login, POS access, and permissions.'
                : 'Activating this staff member restores their system login, POS access, and permissions.'}
            </p>

            <button
              type="button"
              className={currentStatus === 'active' ? styles.dangerBtn : styles.activateBtn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleStatus();
              }}
              disabled={isStatusPending || isSaving}
            >
              {isStatusPending
                ? currentStatus === 'active'
                  ? 'Deactivating…'
                  : 'Activating…'
                : currentStatus === 'active'
                  ? 'Deactivate Staff Member'
                  : 'Activate Staff Member'}
            </button>
          </section>

          <div className={styles.actions}>
            <Link href={viewHref} className={styles.secondaryBtn}>
              Cancel
            </Link>

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={isSaving || isStatusPending}
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
