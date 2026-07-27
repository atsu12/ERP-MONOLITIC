module.exports = function renderDispatch(dispatch, items) {
  const currency = dispatch.currency || "GHS";

  const rows = items
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${currency} ${Number(item.unit_price).toFixed(2)}</td>
          <td>${currency} ${Number(item.line_total).toFixed(2)}</td>
        </tr>
      `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${dispatch.reference}</title>

<style>

body{
    font-family:Arial,Helvetica,sans-serif;
    margin:40px;
    color:#222;
}

h1{
    margin-bottom:5px;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
}

th,
td{
    border:1px solid #ccc;
    padding:8px;
    text-align:left;
}

th{
    background:#f5f5f5;
}

.summary{
    width:300px;
    margin-left:auto;
    margin-top:20px;
}

.summary td{
    border:none;
    padding:6px 0;
}

.total{
    font-size:18px;
    font-weight:bold;
}

</style>

</head>

<body>

<h1>ZICO STOCK</h1>

<h2>Dispatch Note</h2>

<p><strong>Reference:</strong> ${dispatch.reference}</p>
<p><strong>Status:</strong> ${dispatch.status}</p>
<p><strong>Date:</strong> ${new Date(dispatch.created_at).toLocaleString()}</p>

<hr>

<h3>Customer</h3>

<p>${dispatch.customer_name}</p>
<p>${dispatch.contact_person || ""}</p>
<p>${dispatch.contact || ""}</p>
<p>${dispatch.location || ""}</p>

<table>

<thead>

<tr>
<th>Product</th>
<th>Qty</th>
<th>Unit Price</th>
<th>Line Total</th>
</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

<table class="summary">

<tr>
<td>Subtotal</td>
<td>${currency} ${Number(dispatch.subtotal).toFixed(2)}</td>
</tr>

<tr>
<td>Discount</td>
<td>${currency} ${Number(dispatch.discount).toFixed(2)}</td>
</tr>

<tr class="total">
<td>Grand Total</td>
<td>${currency} ${Number(dispatch.grand_total).toFixed(2)}</td>
</tr>

</table>

</body>
</html>
`;
};