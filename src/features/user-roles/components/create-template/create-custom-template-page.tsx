'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useCreateRole } from '@/features/user-roles/components/create-role/create-role-context';
import { CreateRoleStepper } from '@/features/user-roles/components/shared/create-role-stepper';
import { PermissionsAccordionGrid } from '@/features/user-roles/components/shared/permissions-accordion-grid';
import { FooterActions } from '@/features/user-roles/components/shared/footer-actions';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import {
  withRoleScope,
  withSearchParams,
} from '@/features/user-roles/hooks/use-role-management-level';
import type { UiRoleTemplate } from '@/lib/roles-map';
import { applyEnabledOnCatalog } from '@/lib/roles-map';

import styles from './create-custom-template-page.module.css';

const CUSTOM_PRESET_ID = 'custom';

function isAddUserReturnPath(href: string | null, pathname: string): boolean {
  return (
    pathname.startsWith('/employees/add-user') ||
    pathname.startsWith('/users-roles/add-user') ||
    Boolean(href?.includes('/employees/add-user')) ||
    Boolean(href?.includes('/users-roles/add-user'))
  );
}

type CreateCustomTemplatePageProps = Readonly<{
  roleTemplates?: readonly UiRoleTemplate[];
  loadError?: string | null;
}>;

export function CreateCustomTemplatePage({
  roleTemplates = [],
  loadError = null,
}: CreateCustomTemplatePageProps = {}) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const { level, employeesHref, addUser, createRole } = useUsersRolesNav();
  const {
    permissionCatalog,
    roleName,
    description,
    permissionGroups,
    templateReturnTo,
    setFlow,
    setRoleName,
    setDescription,
    setPermissionGroups,
    reset,
  } = useCreateRole();

  const [presetId, setPresetId] = useState<string>(CUSTOM_PRESET_ID);

  useEffect(() => {
    setFlow('create-template');
  }, [setFlow]);

  const presetTemplates = useMemo(() => {
    const fromApi = roleTemplates.filter((template) => template.defaultPermissions.length > 0);
    return fromApi;
  }, [roleTemplates]);

  const badgeLabel = 'Custom Template';

  function applyCatalogWithCodes(enabledCodes: readonly string[]) {
    if (permissionCatalog.length === 0) return;
    setPermissionGroups(applyEnabledOnCatalog(permissionCatalog, enabledCodes));
  }

  function handlePresetSelect(id: string) {
    setPresetId(id);
    if (id === CUSTOM_PRESET_ID) {
      applyCatalogWithCodes([]);
      return;
    }

    const template = presetTemplates.find((item) => item.id === id);
    if (template) {
      applyCatalogWithCodes(template.defaultPermissions);
    }
  }

  function setPermissionEnabled(groupId: string, permissionId: string, enabled: boolean) {
    setPresetId(CUSTOM_PRESET_ID);
    setPermissionGroups(
      permissionGroups.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              permissions: group.permissions.map((permission) =>
                permission.id === permissionId ? { ...permission, enabled } : permission,
              ),
            },
      ),
    );
  }

  function toggleGroup(groupId: string, enabled: boolean) {
    setPresetId(CUSTOM_PRESET_ID);
    setPermissionGroups(
      permissionGroups.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              permissions: group.permissions.map((permission) => ({
                ...permission,
                enabled: permission.available === false ? permission.enabled : enabled,
              })),
            },
      ),
    );
  }

  const fromAddUser = isAddUserReturnPath(templateReturnTo, pathname);
  const templateSelectHref = withRoleScope(fromAddUser ? addUser.root : createRole.root, level);

  function handleSaveTemplate() {
    if (!roleName.trim()) return;
    const name = roleName.trim();
    const returnHref = templateReturnTo ?? templateSelectHref;
    reset();
    router.push(
      withSearchParams(returnHref, {
        toast: 'template-created',
        name,
      }),
    );
  }

  return (
    <div className={styles.page}>
      <p className={styles.breadcrumb}>
        <Link href={employeesHref}>Users & Roles</Link>
        <span aria-hidden> &gt; </span>
        <Link href={templateSelectHref}>Template</Link>
        <span aria-hidden> &gt; </span>
        <span className={styles.breadcrumbCurrent}>Create Custom Template</span>
      </p>

      <div className={styles.body}>
        {fromAddUser ? null : (
          <CreateRoleStepper currentStepId="permissions" customTemplate completedThrough={1} />
        )}

        {loadError ? (
          <p className={styles.error} role="alert">
            {loadError}
          </p>
        ) : null}

        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <h1 className={styles.title}>Create Custom Template</h1>
            <p className={styles.subtitle}>
              Define a brand new role template from scratch with custom parameters.
            </p>
          </header>

          <div className={styles.fields}>
            <label className={styles.field}>
              <span className={styles.label}>
                Template Name <span className={styles.required}>*</span>
              </span>
              <input
                className={styles.input}
                placeholder="Custom role"
                value={roleName}
                onChange={(event) => setRoleName(event.target.value)}
                required
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Description</span>
              <textarea
                className={styles.textarea}
                placeholder="Assigned to custom restaurant branch supervisors with partial finance approval limits."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
              />
            </label>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.cardTitle}>Configure Permissions</h2>
              <p className={styles.cardSubtitle}>
                Set module access and actions for this role template. Toggles save automatically.
              </p>
            </div>
            <span className={styles.templateBadge}>{badgeLabel}</span>
          </div>

          <div className={styles.presetGrid}>
            {presetTemplates.map((template) => {
              const selected = presetId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  className={`${styles.presetCard} ${selected ? styles.presetSelected : ''}`}
                  onClick={() => handlePresetSelect(template.id)}
                  aria-pressed={selected}
                >
                  {selected ? (
                    <span className={styles.presetCheck} aria-hidden>
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : null}
                  <span className={styles.presetTitle}>{template.title}</span>
                  <span className={styles.presetDesc}>{template.description}</span>
                </button>
              );
            })}
            <button
              type="button"
              className={`${styles.presetCard} ${presetId === CUSTOM_PRESET_ID ? styles.presetSelected : ''}`}
              onClick={() => handlePresetSelect(CUSTOM_PRESET_ID)}
              aria-pressed={presetId === CUSTOM_PRESET_ID}
            >
              {presetId === CUSTOM_PRESET_ID ? (
                <span className={styles.presetCheck} aria-hidden>
                  <Check size={12} strokeWidth={3} />
                </span>
              ) : null}
              <span className={styles.presetTitle}>Custom Setup</span>
              <span className={styles.presetDesc}>Manually set permissions in the next step.</span>
            </button>
          </div>

          {permissionGroups.length === 0 ? (
            <p className={styles.emptyPermissions} role="status">
              No assignable permissions returned from the API for this scope.
            </p>
          ) : (
            <PermissionsAccordionGrid
              permissionGroups={permissionGroups}
              onPermissionEnabled={setPermissionEnabled}
              onToggleAllInGroup={toggleGroup}
            />
          )}
        </section>
      </div>

      <FooterActions
        left={
          <Link href={templateSelectHref} className={styles.secondaryBtn}>
            Cancel
          </Link>
        }
        right={
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleSaveTemplate}
            disabled={!roleName.trim()}
          >
            Save Template
          </button>
        }
      />
    </div>
  );
}
