import React from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

interface PostSelectFieldProps<T extends { id: number; title: string }> {
  value: number | '';
  onChange: (id: number) => void;
  options: T[];
  placeholder: string;
}

export default function PostSelectField<T extends { id: number; title: string }>({
  value,
  onChange,
  options,
  placeholder,
}: PostSelectFieldProps<T>) {
  return (
    <FormControl fullWidth variant="outlined" margin="dense">
      <Select
        displayEmpty
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        renderValue={selected => {
          if (!selected) return <span style={{ color: 'rgba(0,0,0,0.6)' }}>{placeholder}</span>;
          const found = options.find(o => o.id === selected);
          return found ? found.title : '';
        }}
        sx={{ width: '100%' }}
      >
        <MenuItem value="" disabled>
          <em style={{ color: 'rgba(0,0,0,0.6)' }}>{placeholder}</em>
        </MenuItem>
        {options.map(opt => (
          <MenuItem key={opt.id} value={opt.id}>{opt.title}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
