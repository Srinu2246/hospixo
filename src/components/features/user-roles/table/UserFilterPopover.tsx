'use client';

import React from 'react';
import {
  UserListFilterPopover,
  type UserListFilterPopoverProps,
} from '@/components/shared/user-filters/UserListFilterPopover';

export type UserFilterPopoverProps = UserListFilterPopoverProps;

export function UserFilterPopover(props: Readonly<UserFilterPopoverProps>) {
  return <UserListFilterPopover {...props} />;
}
