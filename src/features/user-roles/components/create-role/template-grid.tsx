'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Banknote,
  Building2,
  Check,
  ClipboardList,
  CreditCard,
  Plus,
  Search,
  Shield,
  Store,
  User,
  UtensilsCrossed,
} from 'lucide-react';

import { getCreatableRoleTemplates, type RoleTemplateId } from '@/features/user-roles/config/roles';
import type { UiRoleTemplate } from '@/lib/roles-map';
import { useCreateRole } from '@/features/user-roles/components/create-role/create-role-context';
import { CreateRoleStepper } from '@/features/user-roles/components/shared/create-role-stepper';
import { FooterActions } from '@/features/user-roles/components/shared/footer-actions';
import { SuccessToast } from '@/components/ui/success-toast';
import { useTemplateCreatedToast } from '@/features/user-roles/hooks/use-template-created-toast';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import { withRoleScope } from '@/features/user-roles/hooks/use-role-management-level';

import styles from './template-grid.module.css';

const TEMPLATE_ICONS = {
  shield: Shield,
  building: Building2,
  store: Store,
  clipboard: ClipboardList,
  banknote: Banknote,
  search: Search,
  card: CreditCard,
  utensils: UtensilsCrossed,
  user: User,
} as const;

type TemplateGridProps = Readonly<{
  liveTemplates?: readonly UiRoleTemplate[];
  loadError?: string | null;
}>;

export function TemplateGrid({ liveTemplates, loadError = null }: TemplateGridProps = {}) {
  const router = useRouter();
  const { selectedTemplateId, setSelectedTemplateId, startCustomTemplate } = useCreateRole();
  const { level, employeesHref, createRole } = useUsersRolesNav();
  const { showToast, toastMessage, dismissToast } = useTemplateCreatedToast();
  const fallbackTemplates = getCreatableRoleTemplates(level).map((template) => ({
    id: template.id,
    code: template.id,
    title: template.title,
    description: template.description,
    icon: template.icon,
    defaultPermissions: [] as readonly string[],
  }));
  const templates = liveTemplates?.length ? liveTemplates : fallbackTemplates;
  const templateSelectHref = withRoleScope(createRole.root, level);

  function handleContinue() {
    if (!selectedTemplateId) return;
    router.push(withRoleScope(createRole.permissions, level));
  }

  function handleSelect(id: RoleTemplateId) {
    setSelectedTemplateId(id);
  }

  function handleCreateTemplate() {
    startCustomTemplate(templateSelectHref);
    router.push(withRoleScope(createRole.customTemplate, level));
  }

  return (
    <div className={styles.page}>
      {showToast && toastMessage ? (
        <SuccessToast message={toastMessage} onDismiss={dismissToast} />
      ) : null}

      <p className={styles.breadcrumb}>
        <Link href={employeesHref}>Users & Roles</Link>
        <span aria-hidden> &gt; </span>
        <span className={styles.breadcrumbCurrent}>Template</span>
      </p>

      <div className={styles.body}>
        {loadError ? (
          <p className={styles.error} role="alert">
            {loadError}
          </p>
        ) : null}

        <CreateRoleStepper currentStepId="select-template" />

        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Select a Role Template</h1>
            <p className={styles.subtitle}>
              Choose a starting template to configure specific permissions.
            </p>
          </div>
          <button type="button" className={styles.createTemplateBtn} onClick={handleCreateTemplate}>
            <Plus size={16} strokeWidth={2.5} />
            Create Template
          </button>
        </header>

        <div className={styles.grid}>
          {templates.map((template) => {
            const Icon = TEMPLATE_ICONS[template.icon];
            const selected = selectedTemplateId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
                onClick={() => handleSelect(template.id as RoleTemplateId)}
                aria-pressed={selected}
              >
                {selected ? (
                  <span className={styles.check} aria-hidden>
                    <Check size={12} strokeWidth={3} />
                  </span>
                ) : null}
                <span className={styles.iconWrap}>
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className={styles.cardTitle}>{template.title}</span>
                <span className={styles.cardDesc}>{template.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <FooterActions
        left={
          <Link href={employeesHref} className={styles.secondaryBtn}>
            Cancel
          </Link>
        }
        right={
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleContinue}
            disabled={!selectedTemplateId}
          >
            + Create New Role
          </button>
        }
      />
    </div>
  );
}
