'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { getTemplateById } from '@/features/user-roles/config/roles';
import { roleSummaries } from '@/features/user-roles/config/users';
import { useAddUser } from '@/features/user-roles/components/add-user/add-user-context';
import { AddUserWizardStepper } from '@/features/user-roles/components/add-user/add-user-wizard-stepper';
import { FooterActions } from '@/features/user-roles/components/shared/footer-actions';
import { WizardBreadcrumb } from '@/features/user-roles/components/shared/wizard-breadcrumb';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import { withRoleScope } from '@/features/user-roles/hooks/use-role-management-level';
import { toBranchSelectOptions } from '@/features/user-roles/lib/backend-options';
import { fetchCompanyBranches } from '@/lib/branches-cache';
import { fetchRolesList } from '@/lib/roles';
import { addUserContent } from '@/features/user-roles/config/add-user';
import { validateUserInvitation } from '@/lib/validation/user-invitation';
import type { UserAssignmentOptions } from '@/lib/users-server';

import styles from '../create-user/create-user-page.module.css';

export function AddUserDetailsStep({
  assignmentOptions,
}: Readonly<{ assignmentOptions: UserAssignmentOptions }>) {
  const router = useRouter();

  const { user, roleName, selectedTemplateId, setRoleName, setUser } = useAddUser();

  const { level, employeesHref, addUser } = useUsersRolesNav();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [branchOptions, setBranchOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [roleOptions, setRoleOptions] = useState<
    Array<{ value: string; label: string; code: string }>
  >([]);

  useEffect(() => {
    void (async () => {
      try {
        const [branches, rolesRes] = await Promise.all([fetchCompanyBranches(), fetchRolesList()]);

        const nextBranches = toBranchSelectOptions(branches);
        setBranchOptions(nextBranches);

        if (nextBranches.length > 0) {
          const selectedBranch =
            nextBranches.find((option) => option.label === user.branch) ?? nextBranches[0];
          if (
            user.branch !== selectedBranch.label ||
            user.branchId !== Number(selectedBranch.value)
          ) {
            setUser({
              branch: selectedBranch.label,
              branchId: Number(selectedBranch.value),
            });
          }
        }

        const allowedScopes =
          level === 'branch'
            ? ['branch']
            : level === 'company'
              ? ['company', 'branch']
              : ['organisation', 'company', 'branch'];
        const nextRoles = rolesRes.items
          .filter((role) => allowedScopes.includes(role.scope))
          .map((role) => ({
            value: String(role.id ?? ''),
            label: role.display_name,
            code: role.code,
          }))
          .filter((role) => role.value && role.label && role.code);
        setRoleOptions(nextRoles);

        if (nextRoles.length > 0) {
          const selectedRole =
            nextRoles.find(
              (option) =>
                option.label === roleName ||
                (user.roleCode && option.code === user.roleCode) ||
                (user.roleId && option.value === user.roleId),
            ) ?? nextRoles[0];
          if (
            roleName !== selectedRole.label ||
            user.roleId !== selectedRole.value ||
            user.roleCode !== selectedRole.code
          ) {
            setRoleName(selectedRole.label);
            setUser({ roleId: selectedRole.value, roleCode: selectedRole.code });
          }
        }
      } catch {
        setBranchOptions([]);
        setRoleOptions([]);
      }
    })();
  }, [level, roleName, setRoleName, setUser, user.branch, user.roleCode, user.roleId]);

  const template = getTemplateById(selectedTemplateId);
  const scope = template?.scope ?? user.scope ?? 'branch';

  const companies = assignmentOptions.companies;
  const allBranches = assignmentOptions.branches;
  const activeCompanyId = user.companyId ?? companies[0]?.id ?? null;
  const branches = allBranches.filter((branch) => branch.companyId === activeCompanyId);

  useEffect(() => {
    if (scope === 'organisation' || user.companyId || companies.length === 0) return;

    const company = companies[0];
    const firstBranch = allBranches.find((branch) => branch.companyId === company.id);
    setUser({
      companyId: company.id,
      company: company.name,
      ...(scope === 'branch'
        ? { branchId: firstBranch?.id ?? null, branch: firstBranch?.name ?? '' }
        : {}),
    });
  }, [allBranches, companies, scope, setUser, user.companyId]);

  const summary = useMemo(
    () => roleSummaries[roleName] ?? roleSummaries['Branch Manager'],
    [roleName],
  );

  function handleCompanyChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextId = event.target.value ? Number(event.target.value) : null;
    const found = companies.find((c) => c.id === nextId);
    setUser({
      companyId: nextId,
      company: found?.name ?? '',
      branchId: null,
      branch: '',
    });
  }

  function handleBranchChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextId = event.target.value ? Number(event.target.value) : null;
    const found = branches.find((b) => b.id === nextId);
    setUser({
      branchId: nextId,
      branch: found?.name ?? '',
    });
  }

  function handleContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateUserInvitation({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      scope,
      company: user.company,
      companyId: user.companyId,
      branch: user.branch,
      branchId: user.branchId,
      role: roleName,
      message: user.message,
    });

    if (typeof validation === 'string') {
      setValidationError(validation);
      return;
    }

    const username = user.username.trim();
    if (username.length < 3) {
      setValidationError('Username must be at least 3 characters.');
      return;
    }

    if (user.password.length < 8) {
      setValidationError(addUserContent.review.errors.passwordMin);
      return;
    }

    setValidationError(null);
    router.push(withRoleScope(addUser.permissions, level));
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleContinue}>
        <WizardBreadcrumb
          items={[
            {
              label: 'Template',
              href: withRoleScope(addUser.root, level),
            },
            {
              label: 'Create User',
            },
          ]}
        />

        <div className={styles.body}>
          <AddUserWizardStepper currentStepId="create-user" />

          <div className={styles.card}>
            <header className={styles.header}>
              <h1 className={styles.title}>Create New User</h1>

              <p className={styles.subtitle}>Provide user details and assign their access scope.</p>
            </header>

            {assignmentOptions.error ? (
              <p role="alert" className={styles.error}>
                {assignmentOptions.error}
              </p>
            ) : null}

            {validationError ? (
              <p role="alert" className={styles.error}>
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
                    value={user.firstName}
                    onChange={(event) =>
                      setUser({
                        firstName: event.target.value,
                      })
                    }
                    placeholder="Enter first name"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Last Name</span>

                  <input
                    className={styles.input}
                    value={user.lastName}
                    onChange={(event) =>
                      setUser({
                        lastName: event.target.value,
                      })
                    }
                    placeholder="Enter last name"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Email Address</span>

                  <input
                    type="email"
                    className={styles.input}
                    value={user.email}
                    onChange={(event) =>
                      setUser({
                        email: event.target.value,
                      })
                    }
                    placeholder="e.g. sarah.chen@example.com"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Username</span>

                  <input
                    className={styles.input}
                    value={user.username}
                    onChange={(event) =>
                      setUser({
                        username: event.target.value,
                      })
                    }
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
                    value={user.password}
                    onChange={(event) =>
                      setUser({
                        password: event.target.value,
                      })
                    }
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
                    value={user.phone}
                    onChange={(event) =>
                      setUser({
                        phone: event.target.value,
                      })
                    }
                    placeholder="+1 (555) 000-0000"
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
                        value={user.companyId ?? ''}
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
                        value={user.companyId ?? ''}
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
                          value={user.branchId ?? ''}
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
                    <span className={styles.label}>Selected Role</span>

                    <select
                      className={styles.select}
                      value={roleName}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        const selected = roleOptions.find((option) => option.label === nextValue);
                        setRoleName(nextValue);
                        setUser({
                          roleId: selected ? selected.value : null,
                          roleCode: selected ? selected.code : null,
                        });
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

                  <div className={styles.roleSummary}>
                    <p className={styles.roleSummaryTitle}>Role Summary</p>

                    <p className={styles.roleSummaryText}>{summary}</p>
                  </div>
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
            <button type="submit" className={styles.primaryBtn}>
              Set-up Permissions
            </button>
          }
        />
      </form>
    </div>
  );
}
