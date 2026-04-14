const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
  'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
  'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

export default function DistrictSelect({
  value,
  onChange,
  required = false,
  placeholder = 'Select District',
}) {
  return (
    <select
      className="hm-input"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      required={required}
    >
      <option value="">{placeholder}</option>
      {SRI_LANKA_DISTRICTS.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  );
}
