import * as React from "react";
import { Modal } from "components/modal/Modal";
import { useModal } from "context/ModalContext";
import useFetch from "lib/useFetch";
import { Loader } from "components/Loader";
import { ModalIds } from "types/ModalIds";
import { Tab } from "@headlessui/react";
import { Button } from "components/Button";
import { Citizen, User } from "types/prisma";
import { useTranslations } from "next-intl";
import { FormField } from "components/form/FormField";
import { Input } from "components/form/inputs/Input";
import { Table } from "components/shared/Table";

type CitizenWithUser = Citizen & {
  user: User | null;
};

interface Props {
  citizens: CitizenWithUser[];
  setCitizens: React.Dispatch<React.SetStateAction<CitizenWithUser[]>>;
}

export function AllCitizensTab({ citizens, setCitizens }: Props) {
  const [search, setSearch] = React.useState("");
  const [tempValue, setTempValue] = React.useState<CitizenWithUser | null>(null);
  const [reason, setReason] = React.useState("");
  const reasonRef = React.useRef<HTMLInputElement>(null);

  const { state, execute } = useFetch();
  const { isOpen, openModal, closeModal } = useModal();

  const tCitizen = useTranslations("Citizen");
  const t = useTranslations("Management");
  const common = useTranslations("Common");

  function handleDeleteClick(value: CitizenWithUser) {
    setTempValue(value);
    openModal(ModalIds.AlertDeleteCitizen);
  }

  async function handleDelete() {
    if (!tempValue) return;

    if (!reason.trim() && reasonRef.current) {
      return reasonRef.current.focus();
    }

    const { json } = await execute(`/admin/manage/citizens/${tempValue.id}`, {
      method: "DELETE",
      data: { reason },
    });

    if (json) {
      setCitizens((p) => p.filter((v) => v.id !== tempValue.id));
      setTempValue(null);
      closeModal(ModalIds.AlertDeleteCitizen);
    }
  }

  return (
    <Tab.Panel>
      {citizens.length <= 0 ? (
        <p className="mt-5">{t("noCitizens")}</p>
      ) : (
        <ul className="mt-5">
          <FormField label={common("search")} className="my-2">
            <Input
              placeholder="john doe"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              className=""
            />
          </FormField>

          <Table
            filter={search}
            data={citizens.map((citizen) => ({
              name: `${citizen.name} ${citizen.surname}`,
              gender: citizen.gender.value,
              ethnicity: citizen.ethnicity.value,
              hairColor: citizen.hairColor,
              eyeColor: citizen.eyeColor,
              weight: citizen.weight,
              height: citizen.height,
              actions: (
                <Button small variant="danger" onClick={() => handleDeleteClick(citizen)}>
                  {common("delete")}
                </Button>
              ),
            }))}
            columns={[
              { Header: tCitizen("fullName"), accessor: "name" },
              { Header: tCitizen("gender"), accessor: "gender" },
              { Header: tCitizen("ethnicity"), accessor: "ethnicity" },
              { Header: tCitizen("hairColor"), accessor: "hairColor" },
              { Header: tCitizen("eyeColor"), accessor: "eyeColor" },
              { Header: tCitizen("weight"), accessor: "weight" },
              { Header: tCitizen("height"), accessor: "height" },
              { Header: common("actions"), accessor: "actions" },
            ]}
          />
        </ul>
      )}

      <Modal
        title={tCitizen("deleteCitizen")}
        onClose={() => closeModal(ModalIds.AlertDeleteCitizen)}
        isOpen={isOpen(ModalIds.AlertDeleteCitizen)}
      >
        <div>
          <p className="my-3">
            {tCitizen.rich("alert_deleteCitizen", {
              citizen: tempValue && `${tempValue.name} ${tempValue.surname}`,
              span: (children) => {
                return <span className="font-semibold">{children}</span>;
              },
            })}
          </p>
          <FormField label="Reason">
            <Input ref={reasonRef} value={reason} onChange={(e) => setReason(e.target.value)} />
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-2 mt-2">
          <Button
            variant="cancel"
            disabled={state === "loading"}
            onClick={() => closeModal(ModalIds.AlertDeleteCitizen)}
          >
            {common("cancel")}
          </Button>
          <Button
            disabled={state === "loading"}
            className="flex items-center"
            variant="danger"
            onClick={handleDelete}
          >
            {state === "loading" ? <Loader className="mr-2 border-red-200" /> : null}{" "}
            {common("delete")}
          </Button>
        </div>
      </Modal>
    </Tab.Panel>
  );
}