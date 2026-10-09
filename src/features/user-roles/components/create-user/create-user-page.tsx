'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { routes } from '@/config/routes';
import { type UserRole } from '@/features/user-roles/config/users';
import { AddUserWizardStepper } from '@/features/user-roles/components/add-user/add-user-wizard-stepper';
import { FooterActions } from '@/features/user-roles/components/shared/footer-actions';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import { toBranchSelectOptions } from '@/features/user-roles/lib/backend-options';
import { fetchCompanyBranches } from '@/lib/branches-cache';
import { fetchRolesList } from '@/lib/roles';
import { validateUserInvitation } from '@/lib/validation/user-invitation';
import { addUserContent } from '@/features/user-roles/config/add-user';
import { createUserAction } from '@/lib/users-actions';
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
  const [roleCode, setRoleCode] = useState<string | null>(null);
  const [branchOptions, setBranchOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [roleOptions, setRoleOptions] = useState<
    Array<{ value: string; label: string; code: string }>
  >([]);
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
        const nextRoles = rolesRes.items
          .filter((roleRecord) => allowedScopes.includes(roleRecord.scope))
          .map((roleRecord) => ({
            value: String(roleRecord.id ?? ''),
            label: roleRecord.display_name,
            code: roleRecord.code,
          }))
          .filter((option) => option.value && option.label && option.code);
        setRoleOptions(nextRoles);
        if (nextRoles.length > 0) {
          const selectedRole = nextRoles.find((option) => option.label === role) ?? nextRoles[0];
          if (
            role !== selectedRole.label ||
            roleId !== selectedRole.value ||
            roleCode !== selectedRole.code
          ) {
            setRole(selectedRole.label as UserRole);
            setRoleId(selectedRole.value);
            setRoleCode(selectedRole.code);
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
    const usernameValue = username.trim();
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
      message: '',
    });

    const selectedBranchId = branchOptions.find((option) => option.label === branch)?.value ?? null;
    const selectedRoleOption = roleOptions.find((option) => option.label === role);
    if (selectedBranchId) setBranchId(Number(selectedBranchId));
    if (selectedRoleOption) {
      setRoleId(selectedRoleOption.value);
      setRoleCode(selectedRoleOption.code);
    }

    if (typeof validation === 'string') {
      setValidationError(validation);
      return;
    }

    if (usernameValue.length < 3) {
      setValidationError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 8) {
      setValidationError(addUserContent.review.errors.passwordMin);
      return;
    }

    setValidationError(null);

    startTransition(async () => {
      const resolvedRoleCode = roleCode ?? toApiRoleCode(role);
      const result = await createUserAction({
        email: emailValue,
        username: usernameValue,
        password,
        first_name: firstNameValue,
        last_name: lastNameValue || null,
        phone: phoneValue || null,
        role_code: resolvedRoleCode,
        company_id: scope === 'organisation' ? null : companyId,
        branch_id: scope === 'branch' ? branchId : null,
      });

      if (!result.ok) {
        setValidationError(result.message ?? addUserContent.review.errors.createFailed);
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
        sendInvite: 'false',
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
                  <span className={styles.label}>Username</span>
                  <input
                    className={styles.input}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. srinukummitha"
                    autoComplete="off"
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Password</span>
                  <input
                    type="password"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    minLength={8}
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
              {isPending ? 'Creating…' : 'Create User'}
            </button>
          }
        />
      </form>
    </div>
  );
}
