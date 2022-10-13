import { IconButton, Text, Box, VStack } from "@chakra-ui/react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DeleteIcon from "@chakra-ui/icons";

import { Module, Semester } from "../interfaces/planner";
import ModuleBox from "./OldModuleBox";

interface PlannerContainerProps {
  semester: Semester;
  id: string;
  handleModuleClose: (module: Module) => void;
}

const PlannerContainer = ({
  semester,
  id,
  handleModuleClose,
}: PlannerContainerProps) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div ref={setNodeRef}>
      <Box
        alignItems="baseline"
        bgColor="purple.50"
        borderRadius="0.5rem"
        minH="22em"
        minW="13em"
      >
        <SortableContext
          items={semester.modules.map((x) => {
            console.log("Hi");
            console.log(semester);
            return x.code;
          })}
          id={id}
          strategy={verticalListSortingStrategy}
        >
          <VStack>
            <Text
              padding="2"
              fontSize={"sm"}
              fontWeight="bold"
              color={"black.900"}
            >
              Year {semester.year} Sem {semester.semester}
            </Text>
            {semester.modules.map((module) => (
              <ModuleBox
                module={module}
                key={module.code}
                displayModuleClose={true}
                handleModuleClose={handleModuleClose}
              />
            ))}
          </VStack>
        </SortableContext>
      </Box>
    </div>
  );
};

export default PlannerContainer;