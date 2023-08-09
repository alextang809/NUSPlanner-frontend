import Select, { ActionMeta, SingleValue } from "react-select";
import { WindowedMenuList } from "react-windowed-select";
import { FormControl, Text, useDisclosure } from "@chakra-ui/react";
import { fetchBasicModuleInfo } from "../../api/moduleAPI";
import { Module } from "../../interfaces/planner";
import * as models from "../../models";
import { useAppContext } from "../AppContext";
import { DEFAULT_MODULE_COLOR } from "../../constants/moduleColor";
import React, { useEffect, useState } from "react";
import { FormatOptionLabelMeta } from "react-select/dist/declarations/src/Select";
import { applyPrereqValidation } from "../../utils/moduleUtils";

interface ModuleDropdownProps {
  module: Module;
  options: any;
  isDragging: boolean;
  isExemption: boolean;
  isAPC: boolean;
  forceUpdate?: () => void;
  setIsValidateButtonDisabled?: (isDisabled: boolean) => void;
}

const ModuleDropdown = ({
  module,
  options,
  isDragging,
  isExemption,
  isAPC,
  forceUpdate,
  setIsValidateButtonDisabled,
}: ModuleDropdownProps) => {
  const { mainViewModel, setMainViewModel } = useAppContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [onNoOptionsMessage, setOnNoOptionsMessage] = useState<string>("Start typing to search");
  useEffect(onClose, [isDragging]);

  let underlyingModule: models.Module | null = null;

  if (module.getUnderlyingModule) {
    const tempModule = module.getUnderlyingModule();
    if (tempModule !== undefined) {
      underlyingModule = tempModule;
    }
  }

  const handleChange = async (
    selectedModule: SingleValue<{ label: string; value: string }>,
    _: ActionMeta<{ label: string; value: string }>,
  ) => {
    if (selectedModule === null || selectedModule.value === undefined) return;

    const basicModuleInfo = await fetchBasicModuleInfo(
      mainViewModel.startYear,
      selectedModule.value,
    );
    let newUnderlyingModule: models.Module;
    if (basicModuleInfo === undefined) {
      newUnderlyingModule = new models.Module(selectedModule.value, "", 4);
    } else {
      newUnderlyingModule = new models.Module(
        basicModuleInfo.moduleCode,
        basicModuleInfo.title,
        basicModuleInfo.moduleCredit,
      );
    }

    if (module.selectModule !== undefined) {
      if (underlyingModule !== null) {
        mainViewModel.removeModuleViewModelFromGlobalState(
          underlyingModule.code,
        );
      }

      underlyingModule = newUnderlyingModule;
      module.selectModule(newUnderlyingModule);
      mainViewModel.addModuleToGlobalState(newUnderlyingModule);
    }

    const name = selectedModule.label.replace(selectedModule.value, "");
    setSelectedModuleName(name);

    if (isExemption) {
      if (basicModuleInfo !== undefined) {
        const [_, newExemptionModule] =
          mainViewModel.addModuleAndViewModelToGlobalState(
            basicModuleInfo.moduleCode,
            basicModuleInfo.title,
            basicModuleInfo.moduleCredit,
          );
        mainViewModel.exemptions.addModule(newExemptionModule);
      }
    } else if (isAPC) {
      if (basicModuleInfo !== undefined) {
        const [_, newExemptionModule] =
          mainViewModel.addModuleAndViewModelToGlobalState(
            basicModuleInfo.moduleCode,
            basicModuleInfo.title,
            basicModuleInfo.moduleCredit,
          );
        mainViewModel.apcs.addModule(newExemptionModule);
      }
    }

    await applyPrereqValidation(
      mainViewModel.startYear,
      mainViewModel.planner,
    ).then((semesters) => {
      mainViewModel.validate();
      const isPrereqsViolated =
        semesters
          .slice(2)
          .map((semester) => semester.modules)
          .flat(1)
          .filter((module) => module.prereqsViolated?.length).length > 0;
      if (setIsValidateButtonDisabled !== undefined) {
        setIsValidateButtonDisabled(isPrereqsViolated);
      }
    });

    if (forceUpdate !== undefined) {
      forceUpdate();
    }
  };

  const moduleColor = module.color ? module.color[0] : DEFAULT_MODULE_COLOR;
  const moduleColorInReact =
    "var(--chakra-colors-" +
    moduleColor.split(".")[0] +
    "-" +
    moduleColor.split(".")[1] +
    ")";
  const moduleColorInReactDarker =
    "var(--chakra-colors-" +
    moduleColor.split(".")[0] +
    "-" +
    (Number(moduleColor.split(".")[1]) + 100) +
    ")";
  const customStyles = {
    option: (provided: any, state: any): any => ({
      ...provided,
      padding: "0.3rem",
      fontSize: "0.7rem",
      color: "black",
      backgroundColor: state.isSelected ? moduleColorInReactDarker : "white",
      "&:hover": {
        backgroundColor: moduleColorInReact,
      },
    }),
    placeholder: (provided: any) => {
      return {
        ...provided,
        fontSize: "0.8rem",
        color: "black",
      };
    },
    singleValue: (defaultStyles: any) => {
      return {
        ...defaultStyles,
        fontSize: "0.8rem",
        color: "black",
      };
    },
    control: (provided: any, state: any) => {
      return {
        ...provided,
        backgroundColor: moduleColorInReactDarker,
        border: 0,
        boxShadow: 0,
      };
    },
    dropdownIndicator: (provided: any) => {
      return {
        ...provided,
        color: "black",
        "&:hover": {
          color: "black",
        },
      };
    },
    indicatorSeparator: (provided: any) => {
      return {
        ...provided,
        backgroundColor: "black",
      };
    },
    container: (provided: any) => {
      return {
        ...provided,
        position: "static",
      };
    },
    menu: (provided: any) => {
      return {
        ...provided,
        position: "absolute",
      };
    },
  };

  const [selectedModuleName, setSelectedModuleName] = React.useState("");

  const formatOptionLabel = (
    data: { label: string; value: string },
    formatOptionLabelMeta: FormatOptionLabelMeta<{ label: string; value: any }>,
  ) => {
    if (formatOptionLabelMeta.context === "value") {
      return (
        <Text fontSize="0.8rem" color="black">
          {data.value}
        </Text>
      );
    }
    return (
      <Text fontSize="0.8rem" color="black">
        {data.label}
      </Text>
    );
  };

  const selectProps =
    options.length > 500
      ? {
          options: showOptions ? options : [],
          onInputChange: (typedOption: string) => {
            if (typedOption.length >= 2) {
              setOnNoOptionsMessage("No modules found");
              setShowOptions(true);
            } else {
              setOnNoOptionsMessage("Start typing to search");
              setShowOptions(false);
            }
          },
        }
      : {
          options,
        };

  return (
    <>
      <FormControl>
        <Select
          {...selectProps}
          placeholder={"Select a module"}
          value={
            !!underlyingModule
              ? {
                  label: `${underlyingModule.code} ${underlyingModule.name}`,
                  value: underlyingModule.code,
                }
              : undefined
          }
          closeMenuOnSelect={true}
          styles={customStyles}
          menuPosition="fixed"
          onChange={handleChange}
          formatOptionLabel={formatOptionLabel}
          menuIsOpen={isOpen}
          onMenuOpen={onOpen}
          onMenuClose={onClose}
          components={{ MenuList: WindowedMenuList }}
          noOptionsMessage={() => onNoOptionsMessage}
          menuPlacement="auto"
          options={selectProps.options}
        />
      </FormControl>
      {!!module.getUnderlyingModule && (
        <Text color="black.900" fontSize={"xs"}>
          {module.getUnderlyingModule()?.name}
        </Text>
      )}
    </>
  );
};

export default ModuleDropdown;
