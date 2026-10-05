'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Mail, Pencil, Phone } from 'lucide-react';
import { useEffect } from 'react';

import { getTeamUserAvatarSrc } from '@/features/user-roles/config/users';
import { PermissionsAccordionGrid } from '@/features/user-roles/components/shared/permissions-accordion-grid';
import { UserAvatar } from '@/features/user-roles/components/shared/user-avatar';
import { WizardBreadcrumb } from '@/features/user-roles/components/shared/wizard-breadcrumb';
import { useMergedTeamUser } from '@/features/user-roles/hooks/use-merged-team-users';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';

import type { EditStaffPageData } from '@/lib/users-server';

import accordionStyles from '../create-role/permissions-accordion.module.css';
import styles from '../edit-staff/edit-staff-page.module.css';

const LAST_VIEWED_KEY = 'hospixo.last-viewed-staff';

interface ViewStaffPageProps {
  staffId: string;
  initialData?: EditStaffPageData;
}

export function ViewStaffPage({ staffId, initialData }: Readonly<ViewStaffPageProps>) {
  const { employeesHref, editStaffPrefix } = useUsersRolesNav();
  const fallbackStaff = useMergedTeamUser(staffId);
  const backendStaff = initialData?.staff;
  const permissionGroups = initialData?.permissionGroups ?? [];

  useEffect(() => {
    try {
      sessionStorage.setItem(LAST_VIEWED_KEY, staffId);
    } catch {
      /* ignore */
    }
  }, [staffId]);

  const firstName = backendStaff?.firstName || fallbackStaff?.firstName || 'Marco';
  const lastName = backendStaff?.lastName || fallbackStaff?.lastName || 'Rossi';
  const email = backendStaff?.email || fallbackStaff?.email || 'marco@email.com';
  const phone = backendStaff?.phone || fallbackStaff?.phone || '+1 (555) 123-4567';
  const role =
    backendStaff?.role ||
    (fallbackStaff?.id === 'u-marco-rossi' ? 'Head Chef' : (fallbackStaff?.role ?? 'Head Chef'));
  const department = fallbackStaff?.department ?? 'Operations';
  const startDate = backendStaff?.createdAt
    ? new Date(backendStaff.createdAt).toLocaleDateString('en-GB')
    : (fallbackStaff?.startDate ?? '03/15/2024');
  const employmentType = fallbackStaff?.employmentType ?? 'Full-time';
  const status = backendStaff?.status || fallbackStaff?.status || 'active';
  const editHref = `${editStaffPrefix}/${staffId}`;
  const avatarSrc = fallbackStaff ? getTeamUserAvatarSrc(fallbackStaff) : undefined;

  return (
    <div className={styles.page}>
      <WizardBreadcrumb items={[{ label: 'View Staff Profile' }]} />

      <div className={styles.body}>
        <header className={styles.topBar}>
          <div className={styles.titleRow}>
            <Link href={employeesHref} className={styles.back} aria-label="Back to Users & Roles">
              <ArrowLeft size={18} />
            </Link>
            <UserAvatar
              firstName={firstName}
              lastName={lastName}
              src={avatarSrc}
              color={fallbackStaff?.avatarColor}
              size="lg"
            />
            <div>
              <div className={styles.titleWithBadge}>
                <h1 className={styles.pageTitle}>View Staff Profile</h1>
                <span
                  className={`${styles.statusBadge} ${
                    status === 'active' ? styles.statusBadgeActive : styles.statusBadgeDisabled
                  }`}
                >
                  <span
                    className={`${styles.statusDot} ${
                      status === 'active' ? styles.statusDotActive : styles.statusDotDisabled
                    }`}
                  />
                  {status === 'active' ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className={styles.pageSubtitle}>
                {firstName} {lastName}
              </p>
            </div>
          </div>
          <Link href={editHref} className={styles.primaryBtn}>
            <Pencil size={16} />
            Edit Staff Profile
          </Link>
        </header>

        <div className={styles.card}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <span className={styles.label}>First Name</span>
                <p className={styles.readonlyValue}>{firstName}</p>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Last Name</span>
                <p className={styles.readonlyValue}>{lastName}</p>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Email Address</span>
                <p className={`${styles.readonlyValue} ${styles.withIcon}`}>
                  <Mail size={16} className={styles.inlineIcon} />
                  {email}
                </p>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Phone Number</span>
                <p className={`${styles.readonlyValue} ${styles.withIcon}`}>
                  <Phone size={16} className={styles.inlineIcon} />
                  {phone}
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Employment Details</h2>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <span className={styles.label}>Role</span>
                <p className={styles.readonlyValue}>{role}</p>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Department</span>
                <p className={styles.readonlyValue}>{department}</p>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Start Date</span>
                <p className={`${styles.readonlyValue} ${styles.withIcon}`}>
                  <Calendar size={16} className={styles.inlineIcon} />
                  {startDate}
                </p>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Employment Type</span>
                <p className={styles.readonlyValue}>{employmentType}</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Configure Permissions</h2>
            <div className={accordionStyles.metaGrid}>
              <div className={accordionStyles.field}>
                <span className={accordionStyles.label}>Role Name</span>
                <p className={styles.readonlyValue}>{role}</p>
              </div>
              <div className={accordionStyles.field}>
                <span className={accordionStyles.label}>Description</span>
                <p className={styles.readonlyValue}>—</p>
              </div>
            </div>
          </section>

          <section className={styles.sectionLast}>
            <h2 className={accordionStyles.sectionTitle}>Permissions</h2>
            <PermissionsAccordionGrid permissionGroups={permissionGroups} readOnly />
          </section>
        </div>
      </div>
    </div>
  );
}
