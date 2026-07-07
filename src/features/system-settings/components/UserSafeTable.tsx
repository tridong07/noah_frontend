'use client';
import { useFormContext } from 'react-hook-form';

export default function UserSafeTable({ initialSafe } : { initialSafe: any[] }) {
  const { register } = useFormContext();
  return (
    <table className="w-full border">
      <thead><tr><th>Menu</th><th>Xem</th><th>Sửa</th></tr></thead>
      <tbody>
        {initialSafe?.map((s, i) => (
          <tr key={s.MENU_ID}>
            <td>{s.MENU_ID}</td>
            <td><input type="checkbox" {...register(`safeList.${i}.lmtSel`)} defaultChecked={s.LMT_SEL === 'Y'} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}