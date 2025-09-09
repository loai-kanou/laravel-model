export type ModelProps = {
  file: string;
  className: string;
  fillable: string[];
  guarded: string[] | null; // null => not set
  casts: Record<string, string>;
  hidden: string[];
  appends: string[];
  relations: Record<string, string>; // name -> relation type
};
