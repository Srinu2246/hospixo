import { describe, expect, it } from 'vitest';

import {
  buildBulkCreateTablesInput,
  buildBulkUpdateTablesInput,
  buildCreateFloorInput,
  buildUpdateFloorInput,
  buildUpdateTableInputFromEdit,
} from '@/features/floor-table-setup/lib/floors-map';
import type { FloorTableItem } from '@/features/floor-table-setup/types/floor-table-setup';

const sampleTable: FloorTableItem = {
  id: '42',
  number: 'T01',
  capacity: 4,
  status: 'available',
  configStatus: 'active',
  version: 3,
  reservations: true,
  area: 'Main',
  shape: 'round',
  sectionId: 'section-1',
};

describe('buildCreateFloorInput', () => {
  it('includes floor_type on create', () => {
    expect(
      buildCreateFloorInput({
        name: 'Ground Floor',
        code: 'GF-001',
        type: 'indoor',
        description: '',
        active: true,
      }),
    ).toEqual({
      name: 'Ground Floor',
      code: 'GF-001',
      floor_type: 'indoor',
      description: null,
      is_active: true,
    });
  });

  it('defaults floor_type to indoor when type is omitted from the form', () => {
    expect(
      buildCreateFloorInput({
        name: 'Balkani',
        code: 'BL-1',
        type: '',
        description: '',
        active: true,
      }),
    ).toEqual({
      name: 'Balkani',
      code: 'BL-1',
      floor_type: 'indoor',
      description: null,
      is_active: true,
    });
  });
});

describe('buildUpdateFloorInput', () => {
  it('omits floor_type on update', () => {
    expect(
      buildUpdateFloorInput(
        {
          name: 'Ground Floor',
          code: 'GF-001',
          type: 'outdoor',
          description: 'Updated',
          active: true,
        },
        2,
      ),
    ).toEqual({
      name: 'Ground Floor',
      code: 'GF-001',
      description: 'Updated',
      is_active: true,
      version: 2,
    });
  });
});

describe('buildBulkCreateTablesInput', () => {
  it('includes name and table_number for API create', () => {
    expect(
      buildBulkCreateTablesInput([{ number: 'T001', capacity: 4, reservations: true }]),
    ).toEqual({
      items: [
        {
          name: 'T001',
          table_number: 'T001',
          capacity: 4,
          reservations_enabled: true,
          is_active: true,
        },
      ],
    });
  });
});

describe('buildUpdateTableInputFromEdit', () => {
  it('includes shape, reservations, and version for API updates', () => {
    expect(
      buildUpdateTableInputFromEdit(
        {
          number: sampleTable.number,
          capacity: sampleTable.capacity,
          shape: 'rectangle',
          configStatus: 'maintenance',
          reservations: false,
        },
        3,
      ),
    ).toEqual({
      name: 'T01',
      table_number: 'T01',
      capacity: 4,
      shape: 'rectangle',
      is_active: false,
      status: 'maintenance',
      reservations_enabled: false,
      version: 3,
    });
  });
});

describe('buildBulkUpdateTablesInput', () => {
  it('maps table ids and versions for bulk PATCH', () => {
    expect(buildBulkUpdateTablesInput([sampleTable])).toEqual({
      items: [
        {
          table_id: '42',
          name: 'T01',
          table_number: 'T01',
          capacity: 4,
          shape: 'round',
          is_active: true,
          status: 'active',
          reservations_enabled: true,
          version: 3,
        },
      ],
    });
  });
});
