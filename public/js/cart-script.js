const deleteItem = (btn,id)=>{
    const itemId = id;
    const csrf = document.querySelector('[name=_csrf]').value;
    const currentElement = btn.closest('.cart-item');
    const subTotalElement = document.querySelector('[id=totalPrice]');
    
    console.log(itemId);

    fetch('/delete-cart-item/'+itemId,{
        method:'DELETE',
        headers :{
            'csrf-token': csrf,
        }
    },).then((response) => {
        return response.json();
    }).then(data=>{
        console.log(data);
        currentElement.parentNode.removeChild(currentElement);
        subTotalElement.innerHTML = data.total;
    }).catch(err=>{
        console.log(err);
    });
}; 