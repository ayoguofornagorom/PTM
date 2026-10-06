import React from "react";
import { Link } from "react-router-dom";
import coverimg from "../assets/images/Component 1.png";

const Coverpage: React.FC = () => {
  return (
    <div>
      <div className="flex gap-4 items-center justify-center pt-20">
        <div className="flex flex-col gap-5 px-5 py-10 text-start w-133.75">
          <h3 className="text-[50px] text-medium">
            Manage your Tasks on{" "}
            <span className="text-[#974FD0]">TaskDuty</span>
          </h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Non tellus,
            sapien, morbi ante nunc euismod ac felis ac. Massa et, at platea
            tempus duis non eget. Hendrerit tortor fermentum bibendum mi nisl
            semper porttitor. Nec accumsan.
          </p>
          <Link
            to="/mytasks"
            className="w-fit py-2 px-4 text-[#FAF9FB] rounded-md hover:bg-[#292929] hover:text-[#B8B6B6]"
          >
            Go to My Tasks
          </Link>
        </div>

        <div className="flex items-center">
          <img src={coverimg} alt="Cover" className="" />
        </div>
      </div>
    </div>
  );
};

export default Coverpage;
