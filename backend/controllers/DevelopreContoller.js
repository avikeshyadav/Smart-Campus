async function getDeveloper(req, res) {
    res.status(200).json({
        message:"Developers Getted Success",
    })
}
async function FetchDevelopers(req, res) {
    res.status(200).json({
        message:"Fetched successfully"
    })
}

module.exports ={
    getDeveloper,
    FetchDevelopers,
}