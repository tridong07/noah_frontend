'use client';
import { useFormContext } from 'react-hook-form';

export default function UserRoleCheckbox({ initialRoles }: { initialRoles: any[] }) {
  const { register } = useFormContext();
  return (
    <div className="flex flex-wrap gap-4">
      {initialRoles?.map(role => (
        <label key={role.ROLE_ID}>
          <input type="checkbox" value={role.ROLE_ID} {...register("roleIds")} defaultChecked={role.IS_ASSIGNED === 1} />
          {role.ROLE_NAME}
        </label>
      ))}
    </div>
  );
}