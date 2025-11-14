import SectionJobCategories from "../../sections/about/section-job-categories";
import SectionHowItWorks from "../../sections/about/section-how-it-works";
import SectionUploadCV from "../../sections/about/section-upload-cv";
import SectionTopCompanies from "../../sections/about/section-top-companies";
import { useEffect } from "react";
import { loadScript } from "../../../../../globals/constants";

function AboutUsPage() {

    useEffect(() => {
        loadScript("js/custom.js");
    })

    return (
        <>
            {/* JOBS CATEGORIES SECTION START */}
            <SectionJobCategories />
            {/* JOBS CATEGORIES SECTION END */}

            {/* HOW IT WORK SECTION START */}
            <SectionHowItWorks />
            {/* HOW IT WORK SECTION END */}

            {/* EXPLORE NEW LIFE START */}
            <SectionUploadCV />
            {/* EXPLORE NEW LIFE END */}

            {/* TOP COMPANIES START */}
            <SectionTopCompanies />
            {/* TOP COMPANIES END */}
        </>
    )
}

export default AboutUsPage;
