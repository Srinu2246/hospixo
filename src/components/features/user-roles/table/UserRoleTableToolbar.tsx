'use client';

import React from 'react';
import {
  UserListFilterBar,
  type UserListFilterBarProps,
} from '@/components/shared/user-filters/UserListFilterBar';

export type UserRoleTableToolbarProps = UserListFilterBarProps;

export function UserRoleTableToolbar(props: Readonly<UserRoleTableToolbarProps>) {
  return <UserListFilterBar {...props} />;
}
