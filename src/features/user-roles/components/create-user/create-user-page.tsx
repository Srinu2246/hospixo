'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { routes } from '@/config/routes';
import { type UserRole } from '@/features/user-roles/config/users';
import { AddUserWizardStepper } from '@/features/user-roles/components/add-user/add-user-wizard-stepper';
import { FooterActions } from '@/features/user-roles/components/shared/footer-actions';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import {
  toBranchSelectOptions,
  toRoleSelectOptions,
} from '@/features/user-roles/lib/backend-options';
import { fetchCompanyBranches } from '@/lib/branches-cache';
import { fetchRolesList } from '@/lib/roles';
import { validateUserInvitation } from '@/lib/validation/user-invitation';
import { createUserAction, sendInvitationAction } from '@/lib/users-actions';
import { toApiRoleCode } from '@/lib/users-map';
import type { UserAssignmentOptions } from '@/lib/users-server';

import styles from './create-user-page.module.css';

function resolveScopeFromRole(role: UserRole): 'organisation' | 'company' | 'branch' {
  if (role === 'Organisation Manager' || role === 'Tenant Admin') return 'organisation';
  if (role === 'Company Manager') return 'company';
  return 'branch';
}

export function CreateUserPage({
  assignmentOptions,
}: Readonly<{ assignmentOptions: UserAssignmentOptions }>) {
  const router = useRouter();
  const { employeesHref, invitationSuccess, level } = useUsersRolesNav();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [role, setRole] = useState<UserRole>('Branch Manager');
  const scope = resolveScopeFromRole(role);

  const companies = assignmentOptions.companies;
  const allBranches = assignmentOptions.branches;
  const initialCompany = companies[0];
  const initialBranches = allBranches.filter((branch) => branch.companyId === initialCompany?.id);
  const [company, setCompany] = useState(initialCompany?.name ?? '');
  const [companyId, setCompanyId] = useState<number | null>(initialCompany?.id ?? null);
  const [branch, setBranch] = useState(initialBranches[0]?.name ?? '');
  const [branchId, setBranchId] = useState<number | null>(initialBranches[0]?.id ?? null);
  const [branches, setBranches] = useState(() => initialBranches);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [branchOptions, setBranchOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [roleOptions, setRoleOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [sendInvite, setSendInvite] = useState(true);
  const [message, setMessage] = useState('Welcome to the team! Here is your access to Hospixo.');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCompanyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextId = e.target.value ? Number(e.target.value) : null;
    const found = companies.find((c) => c.id === nextId);
    setCompanyId(nextId);
    setCompany(found?.name ?? '');
    const nextBranches = allBranches.filter((branch) => branch.companyId === nextId);
    setBranches(nextBranches);
    setBranchId(nextBranches[0]?.id ?? null);
    setBranch(nextBranches[0]?.name ?? '');
  }

  function handleBranchChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextId = e.target.value ? Number(e.target.value) : null;
    const found = branches.find((b) => b.id === nextId);
    setBranchId(nextId);
    setBranch(found?.name ?? '');
  }

  useEffect(() => {
    void (async () => {
      try {
        const [branches, rolesRes] = await Promise.all([fetchCompanyBranches(), fetchRolesList()]);

        const nextBranches = toBranchSelectOptions(branches);
        setBranchOptions(nextBranches);
        if (nextBranches.length > 0) {
          const selectedBranch =
            nextBranches.find((option) => option.label === branch) ?? nextBranches[0];
          if (branch !== selectedBranch.label || branchId !== Number(selectedBranch.value)) {
            setBranch(selectedBranch.label);
            setBranchId(Number(selectedBranch.value));
          }
        }

        const allowedScopes =
          level === 'branch'
            ? ['branch']
            : level === 'company'
              ? ['company', 'branch']
              : ['organisation', 'company', 'branch'];
        const nextRoles = toRoleSelectOptions(rolesRes.items).filter((option) => {
          const roleRecord = rolesRes.items.find((item) => String(item.id) === option.value);
          return roleRecord ? allowedScopes.includes(roleRecord.scope) : true;
        });
        setRoleOptions(nextRoles);
        if (nextRoles.length > 0) {
          const selectedRole = nextRoles.find((option) => option.label === role) ?? nextRoles[0];
          if (role !== selectedRole.label || roleId !== selectedRole.value) {
            setRole(selectedRole.label as UserRole);
            setRoleId(selectedRole.value);
          }
        }
      } catch {
        setBranchOptions([]);
        setRoleOptions([]);
      }
    })();
  }, [branch, level, role]);

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstNameValue = firstName.trim();
    const lastNameValue = lastName.trim();
    const emailValue = email.trim();
    const phoneValue = phone.trim();
    const messageValue = message.trim();
    const validation = validateUserInvitation({
      firstName: firstNameValue,
      lastName: lastNameValue,
      email: emailValue,
      phone: phoneValue,
      scope,
      company,
      companyId,
      branch,
      branchId,
      role,
      message: messageValue,
    });

    const selectedBranchId = branchOptions.find((option) => option.label === branch)?.value ?? null;
    const selectedRoleId = roleOptions.find((option) => option.label === role)?.value ?? null;
    if (selectedBranchId) setBranchId(Number(selectedBranchId));
    if (selectedRoleId) setRoleId(selectedRoleId);

    if (typeof validation === 'string') {
      setValidationError(validation);
      return;
    }

    setValidationError(null);

    startTransition(async () => {
      const roleCode = toApiRoleCode(role);
      let result;
      if (sendInvite) {
        result = await sendInvitationAction({
          email: emailValue,
          role_code: roleCode,
          company_id: scope === 'organisation' ? null : companyId,
          branch_id: scope === 'branch' ? branchId : null,
        });
      } else {
        const tempPassword = `Temp@${Math.random().toString(36).slice(-8)}1A`;
        result = await createUserAction({
          email: emailValue,
          password: tempPassword,
          first_name: firstNameValue,
          last_name: lastNameValue || null,
          phone: phoneValue || null,
          role_code: roleCode,
          company_id: scope === 'organisation' ? null : companyId,
          branch_id: scope === 'branch' ? branchId : null,
        });
      }

      if (!result.ok) {
        setValidationError(
          result.message ?? (sendInvite ? 'Unable to send invitation.' : 'Unable to create user.'),
        );
        return;
      }

      const params = new URLSearchParams({
        email: emailValue,
        name: `${firstNameValue} ${lastNameValue}`.trim(),
        role,
        branch:
          scope === 'branch'
            ? branch
            : scope === 'company'
              ? `${company} (All Branches)`
              : 'All Branches',
        scope,
        sendInvite: String(sendInvite),
      });
      router.push(`${invitationSuccess}?${params.toString()}`);
    });
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <p className={styles.breadcrumb}>
          <Link href={employeesHref}>Users & Roles</Link>
          <span aria-hidden> &gt; </span>
          <Link href={routes.platform.usersRoles.addUser.root}>Template</Link>
          <span aria-hidden> &gt; </span>
          <span className={styles.breadcrumbCurrent}>Create User</span>
        </p>

        <div className={styles.body}>
          <AddUserWizardStepper currentStepId="create-user" completedThrough={1} />

          <div className={styles.card}>
            <header className={styles.header}>
              <h1 className={styles.title}>Create New User</h1>
              <p className={styles.subtitle}>Add a new user to the system.</p>
            </header>

            {validationError ? (
              <p id="create-user-error" role="alert" className={styles.error}>
                {validationError}
              </p>
            ) : null}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Staff Information</h2>
              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span className={styles.label}>First Name</span>
                  <input
                    className={styles.input}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Last Name</span>
                  <input
                    className={styles.input}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Email Address</span>
                  <input
                    type="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah.chen@example.com"
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Phone Number</span>
                  <input
                    className={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    aria-describedby={validationError ? 'create-user-error' : undefined}
                  />
                </label>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.grid2}>
                {scope === 'organisation' ? (
                  <div className={styles.assignBlock}>
                    <h2 className={styles.sectionTitle}>Access Scope</h2>
                    <div className={styles.scopeBadgeBox}>
                      <span className={styles.scopeTag}>Organisation-Wide</span>
                      <p className={styles.helper}>
                        This user will have full access across all companies and branches in the
                        organization.
                      </p>
                    </div>
                  </div>
                ) : scope === 'company' ? (
                  <div className={styles.assignBlock}>
                    <h2 className={styles.sectionTitle}>Assign Company</h2>
                    <label className={styles.field}>
                      <span className={styles.label}>Select Company *</span>
                      <select
                        className={styles.select}
                        value={companyId ?? ''}
                        onChange={handleCompanyChange}
                        required
                      >
                        <option value="">Select a company</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <span className={styles.helper}>
                        The user will have access across all branches in the selected company.
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className={styles.assignBlock}>
                    <h2 className={styles.sectionTitle}>Assign Company & Branch</h2>
                    <label className={styles.field}>
                      <span className={styles.label}>Select Company *</span>
                      <select
                        className={styles.select}
                        value={companyId ?? ''}
                        onChange={handleCompanyChange}
                        required
                      >
                        <option value="">Select a company</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Select Branch *</span>
                      {branches.length === 0 ? (
                        <span className={styles.loadingText}>
                          No branches found for this company.
                        </span>
                      ) : (
                        <select
                          className={styles.select}
                          value={branchId ?? ''}
                          onChange={handleBranchChange}
                          required
                        >
                          <option value="">Select a branch</option>
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <span className={styles.helper}>
                        The user will only see data for the selected branch.
                      </span>
                    </label>
                  </div>
                )}
                <div className={styles.assignBlock}>
                  <h2 className={styles.sectionTitle}>Assign Role</h2>
                  <label className={styles.field}>
                    <span className={styles.label}>Select Role</span>
                    <select
                      className={styles.select}
                      value={role}
                      onChange={(e) => {
                        const nextValue = e.target.value as UserRole;
                        setRole(nextValue);
                        const selected = roleOptions.find((option) => option.label === nextValue);
                        setRoleId(selected ? selected.value : null);
                      }}
                    >
                      {roleOptions.length === 0 ? (
                        <option value="">No roles available</option>
                      ) : (
                        roleOptions.map((option) => (
                          <option key={option.value} value={option.label}>
                            {option.label}
                          </option>
                        ))
                      )}
                    </select>
                  </label>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Invitation Settings</h2>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Send invitation email immediately</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={sendInvite}
                  className={`${styles.switch} ${sendInvite ? styles.switchOn : ''}`}
                  onClick={() => setSendInvite((value) => !value)}
                >
                  <span className={styles.switchThumb} />
                </button>
              </div>
              <p className={styles.helper}>
                {sendInvite
                  ? 'An email invitation will be sent to the user with an activation link.'
                  : 'Account will be created immediately without sending an email invitation.'}
              </p>
              <label className={styles.field}>
                <span className={styles.label}>Personal Message (Optional)</span>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>
            </section>
          </div>
        </div>

        <FooterActions
          left={
            <Link href={employeesHref} className={styles.secondaryBtn}>
              Cancel
            </Link>
          }
          right={
            <button type="submit" className={styles.primaryBtn} disabled={isPending}>
              {isPending
                ? sendInvite
                  ? 'Sending…'
                  : 'Creating…'
                : sendInvite
                  ? 'Send Invitation'
                  : 'Create User'}
            </button>
          }
        />
      </form>
    </div>
  );
}
