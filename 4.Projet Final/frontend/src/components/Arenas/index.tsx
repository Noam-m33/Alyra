import { useState } from "react";
import CreateArena from "./Create";
import { ArenaList } from "./List";
import Details from "./Details";
import { ArenaType } from "../../utils/types";

export default function ArenaPages() {
  const [displayForm, setDisplayForm] = useState(false);
  const [displayDetailsContract, setDisplayDetailsContract] = useState<
    ArenaType | false
  >(false);

  if (displayDetailsContract) {
    return (
      <Details
        contract={displayDetailsContract}
        setDisplayDetailsContract={setDisplayDetailsContract}
      />
    );
  }

  if (displayForm) {
    return <CreateArena setDisplayForm={setDisplayForm} />;
  }

  return (
    <ArenaList
      setDisplayForm={setDisplayForm}
      setDisplayDetailsContract={setDisplayDetailsContract}
    />
  );
}
