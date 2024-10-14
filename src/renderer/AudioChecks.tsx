type AudioChecksProps = {
  path: string;
};

export function AudioCheck({ path }: AudioChecksProps) {
  return (
    <div>
      {path.split('/').pop()} {path ? '✅' : '☑️'}
    </div>
  );
}
