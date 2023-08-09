import { Text, Box, VStack, Flex, Spacer } from "@chakra-ui/react";
import { Module, Semester } from "../../interfaces/planner";
import ModuleBox from "../moduleBox/ModuleBox";
import { Droppable } from "react-beautiful-dnd";
import React, { useState } from "react";
import { getModuleCredits } from "../../utils/moduleUtils";

interface SemesterPlannerProps {
  semesterNumber: number;
  id: string;
  semester: Semester;
  semesterIdx: number;
  handleModuleClose: (module: Module) => void;
}

const SemesterPlanner = ({
  semesterNumber,
  id,
  semester,
  semesterIdx,
  handleModuleClose,
}: SemesterPlannerProps) => {
  const semTitle =
    semesterNumber > 2
      ? `Special Term ${semesterNumber - 2}`
      : `Semester ${semesterNumber}`;

  const creditCount = semester.modules.reduce(
    (acum, mod) => acum + (getModuleCredits(mod) ?? 0),
    0,
  );

  return (
    <Box>
      <Flex>
        <Text fontSize={"xs"} fontWeight="bold" color={"blackAlpha.900"} pb={1}>
          {semTitle}
        </Text>
        <Spacer />
        <Text fontSize={"xs"} fontWeight="bold" color={"blackAlpha.600"} pb={1}>
          {creditCount} MCs
        </Text>
      </Flex>
      <Box
        border="dotted"
        borderColor={"blackAlpha.400"}
        borderRadius="0.4rem"
        w="13rem"
        minH="22.5rem"
      >
        <Droppable droppableId={id}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <VStack minW="12rem" minH="18em" padding={"0.4rem 0rem"}>
                {semester.modules.map((module: Module, idx) => (
                  <ModuleBox
                    module={module}
                    key={module.code + idx.toString()}
                    displayModuleClose={true}
                    parentStr={semesterIdx.toString()}
                    handleModuleClose={handleModuleClose}
                    idx={idx}
                  />
                ))}
              </VStack>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Box>
    </Box>
  );
};

export default SemesterPlanner;
