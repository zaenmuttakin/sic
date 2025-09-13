export default function filterMaterialdata(type, data, term) {
  if (type == "equal") {
    return data.filter((item) => {
      return item.mid.toString() === term.toString();
    });
  } else {
    return data.filter((item) => {
      return (
        item.mid.toString().includes(term) ||
        item.desc.toLowerCase().includes(term)
      );
    });
  }
}
