import React from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();
  const placeholderColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';

  return (
    <FormControl fullWidth variant="outlined" margin="dense">
      <Select
        displayEmpty
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        renderValue={selected => {
          if (!selected) return <span style={{ color: placeholderColor }}>{placeholder}</span>;
          const found = options.find(o => o.id === selected);
          return found ? found.title : '';
        }}
        sx={(theme) => ({ 
          width: '100%',
          borderRadius: '12px',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          }
        })}
      >
        <MenuItem value="" disabled>
          <em style={{ color: placeholderColor }}>{placeholder}</em>
        </MenuItem>
        {options.map(opt => (
          <MenuItem key={opt.id} value={opt.id}>{opt.title}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
