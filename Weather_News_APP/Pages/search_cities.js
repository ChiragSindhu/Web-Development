function updatelist() {
    const datalist_ele = document.getElementById("related_items");
    const inputtxt_lng = document.getElementById("ipt_loca-txt").value.length;

    if (inputtxt_lng <= 2) {
        datalist_ele.innerHTML = "";
        return;
    }
    if (datalist_ele.innerHTML.length > 0) return;
    console.log("UPDATED");
}